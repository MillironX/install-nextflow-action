import * as core from "@actions/core"
import * as exec from "@actions/exec"
import * as tc from "@actions/tool-cache"
import * as fs from "fs"
import semver from "semver"
import fetch from "node-fetch"

import {
  check_cache,
  get_nextflow_release,
  install_nextflow
} from "./functions"
import { NextflowRelease } from "./nextflow-release"
import {
  get_latest_nextflow_version,
  get_nextflow_versions
} from "./nf-core-api-wrapper"

async function run(): Promise<void> {
  // CAPSULE_LOG leads to a bunch of boilerplate being output to the logs: turn
  // it off
  core.exportVariable("CAPSULE_LOG", "none")

  // Read in the arguments
  const version = core.getInput("version")
  const get_all = core.getBooleanInput("all")

  // Check the cache for the Nextflow version that matched last time
  if (check_cache(version)) {
    return
  }

  // Get the release info for the desired release
  let release = {} as NextflowRelease
  let resolved_version = ""
  try {
    if (version.includes("latest")) {
      let flavor = version.split("-")[1]
      flavor = flavor ? flavor : "stable"
      release = await get_latest_nextflow_version(flavor)
    } else {
      const nextflow_releases = await get_nextflow_versions()
      release = await get_nextflow_release(version, nextflow_releases)
    }
    resolved_version = release.version
    core.info(
      `Input version '${version}' resolved to Nextflow ${release.version}`
    )
  } catch (e: unknown) {
    if (e instanceof Error) {
      core.setFailed(
        `Could not retrieve Nextflow release matching ${version}.\n${e.message}`
      )
    }
  }

  try {
    // Get Java version from inputs
    const javaVersion = core.getInput("java-version")

    // Install Zulu Java
    core.info(`Setting up Java ${javaVersion}`)

    // Format: https://cdn.azul.com/zulu/bin/zulu17.44.53-ca-jdk17.0.8.1-linux_x64.tar.gz
    // We should get the latest build number for the requested version
    const downloadUrl = `https://api.azul.com/zulu/download/community/v1.0/bundles/latest/?java_version=${javaVersion}&ext=tar.gz&os=linux&arch=x64&distribution=zulu&bitness=64&release_status=ga&bundle_type=jdk`

    // Get the redirect URL which contains the actual download link
    const response = await fetch(downloadUrl)
    if (!response.ok) {
      throw new Error(`Failed to get download URL: ${response.statusText}`)
    }
    interface DownloadInfo {
      url: string
    }

    const downloadInfo = (await response.json()) as DownloadInfo

    const zuluVersion = await tc.downloadTool(downloadInfo.url)
    const extractedJava = await tc.extractTar(zuluVersion)
    const cachedPath = await tc.cacheDir(extractedJava, "Java", javaVersion)
    core.debug(`Added Java to cache: ${cachedPath}`)

    // Add Java to PATH
    core.addPath(`${cachedPath}/bin`)
    core.exportVariable("JAVA_HOME", cachedPath)
    core.exportVariable(`JAVA_HOME_${javaVersion}_X64`, cachedPath)

    // Run Java to check the version
    await exec.exec("java", ["-version"])
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }

  try {
    // Download Nextflow and add it to path
    if (!check_cache(resolved_version)) {
      const nf_install_path = await install_nextflow(release, get_all)
      const cleaned_version = String(semver.clean(resolved_version, true))
      const nf_path = await tc.cacheDir(
        nf_install_path,
        "nextflow",
        cleaned_version
      )
      core.addPath(nf_path)
      core.info(`Downloaded \`nextflow\` to ${nf_path} and added to PATH`)
      core.debug(`Added Nextflow to cache: ${nf_path}`)
      fs.rmdirSync(nf_install_path, { recursive: true })
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      core.setFailed(e.message)
    }
  }

  // Run Nextflow so it downloads its dependencies
  try {
    await exec.exec("nextflow", ["help"])
  } catch (e: unknown) {
    if (e instanceof Error) {
      // fail workflow if Nextflow run does not succeed
      core.setFailed(`Could not run 'nextflow help'. Error: ${e.message}`)
    }
  }
}

run()
