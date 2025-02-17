import test from "ava" //eslint-disable-line import/no-unresolved
import { execSync } from "child_process"

import { get_nextflow_release, install_nextflow } from "../src/functions"
import { NextflowRelease } from "../src/nextflow-release"

// The Nextflow releases we are going to use for testing follow a regular
// pattern: create a mock function to bootstrap some test data without repeating
// ourselves
function nf_release_gen(version_number: string): NextflowRelease {
  const is_edge = version_number.endsWith("-edge")
  const release: NextflowRelease = {
    version: version_number,
    isEdge: is_edge,
    downloadUrl: `https://github.com/nextflow-io/nextflow/releases/download/${version_number}/nextflow`,
    downloadUrlAll: `https://github.com/nextflow-io/nextflow/releases/download/${version_number}/nextflow-${version_number.replace(
      "v",
      ""
    )}-all`
  }
  return release
}

const release_test_macro = test.macro(
  async (
    t,
    input_version: string,
    expected_version: string,
    is_edge_older: boolean
  ) => {
    const releases_set = [
      nf_release_gen("v21.05.1-edge"),
      nf_release_gen("v21.05.0-edge"),
      nf_release_gen("v21.04.2"),
      nf_release_gen("v21.04.1"),
      nf_release_gen("v21.04.0"),
      nf_release_gen("v21.03.0-edge")
    ]
    const release_filtered = releases_set.splice(is_edge_older ? 2 : 0)
    const matched_release = await get_nextflow_release(
      input_version,
      release_filtered
    )
    t.is(matched_release.version, expected_version)
  }
)

test(
  "Major and minor version only (edge newer)",
  release_test_macro,
  "v21.04",
  "v21.04.2",
  false
)
test(
  "Major and minor version only (edge older)",
  release_test_macro,
  "v21.04",
  "v21.04.2",
  true
)
test(
  "Major, minor, and patch version: latest patch (edge newer)",
  release_test_macro,
  "v21.04.2",
  "v21.04.2",
  false
)
test(
  "Major, minor, and patch version: latest patch (edge older)",
  release_test_macro,
  "v21.04.2",
  "v21.04.2",
  true
)
test(
  "Major, minor, and patch version: older patch (edge newer)",
  release_test_macro,
  "v21.04.1",
  "v21.04.1",
  false
)
test(
  "Major, minor, and patch version: older patch (edge older)",
  release_test_macro,
  "v21.04.1",
  "v21.04.1",
  true
)
test(
  "Edge release",
  release_test_macro,
  "v21.03.0-edge",
  "v21.03.0-edge",
  false
)

test("Install Nextflow", async t => {
  const release = nf_release_gen("v23.10.1")
  const install_dir = await install_nextflow(release, false)

  const version_output = execSync(`${install_dir}/nextflow -v`).toString()
  const version_regex = /nextflow version 23\.10\.1.*/
  t.regex(version_output, version_regex)
})
