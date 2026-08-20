import { load } from 'js-yaml'

// User-supplied kubeconfigs must not be allowed to start credential helpers on
// the Cronicle host.  Parse and check the raw config before handing it to the
// Kubernetes client, which otherwise executes users[].user.exec commands.
export function validateKubeConfig(config) {
  const parsed = load(config)

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Kube config must be an object')
  }

  const users = Array.isArray(parsed.users) ? parsed.users : []
  for (const entry of users) {
    const credentials = entry && typeof entry === 'object' ? entry.user : null
    if (!credentials || typeof credentials !== 'object') continue

    if (credentials.exec != null || credentials['auth-provider'] != null || credentials.authProvider != null) {
      throw new Error('Kube config credential plugins are not allowed')
    }
  }

  return parsed
}
