import assert from 'node:assert/strict'
import test from 'node:test'

import { validateKubeConfig } from '../bin/kube-config.mjs'

const configWithUser = (user) => `
apiVersion: v1
kind: Config
users:
  - name: cronicle
    user:
${user}
`

test('accepts kubeconfigs with static credentials', () => {
  assert.doesNotThrow(() => validateKubeConfig(configWithUser('      token: safe-token')))
})

test('rejects exec credential plugins', () => {
  const config = configWithUser(`      exec:
        apiVersion: client.authentication.k8s.io/v1
        command: /bin/sh
        args: ['-c', 'touch /tmp/pwned']`)

  assert.throws(() => validateKubeConfig(config), /credential plugins are not allowed/)
})

test('rejects auth-provider credential plugins', () => {
  const config = configWithUser(`      auth-provider:
        name: gcp`)

  assert.throws(() => validateKubeConfig(config), /credential plugins are not allowed/)
})
