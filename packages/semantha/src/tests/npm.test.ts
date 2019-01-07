import * as path from 'path'
import Docker from 'dockerode'
import getStream from 'get-stream'
import got from 'got'
import delay from 'delay'
import pRetry from 'p-retry'

import { publish } from '../'

describe('npm', () => {
  test(
    'publish publishes workspace correctly',
    async () => {
      const { container, url } = await startRegistry()

      const res = await publish(
        {
          commits: [],
          version: 1,
          workspace: {
            path: path.resolve(__dirname, './__fixtures__/package/'),
            pkg: {
              name: 'package-c',
              version: '1.0.0',
              dependencies: {},
              devDependencies: {},
            },
          },
        },
        {
          registry: url,
        },
      )

      /* Tests */

      expect(res).toEqual({
        status: 'ok',
        release: {
          commits: [],
          version: 1,
          workspace: {
            path: '/packages/package-c',
            pkg: {
              name: 'package-c',
              version: '1.0.0',
              dependencies: {},
              devDependencies: {},
            },
          },
        },
      })

      stopRegistry(container)
    },
    180 * 1000,
  )

  test('publish reports error correctly', async () => {
    const res = await publish(
      {
        commits: [],
        version: 1,
        workspace: {
          path: path.resolve(__dirname, './__fixtures__/non_existant/'),
          pkg: {
            name: 'package-c',
            version: '1.0.0',
            dependencies: {},
            devDependencies: {},
          },
        },
      },
      {
        registry: '',
      },
    )

    /* Tests */

    expect(res).toEqual({
      status: 'err',
      message: 'Command failed: npm publish',
    })
  })
})

/* Helper functions */

const IMAGE = 'semanticrelease/npm-registry-docker:latest'
const SERVER_PORT = 15986
const COUCHDB_PORT = 5984
const SERVER_HOST = 'localhost'
const COUCHDB_USER = 'admin'
const COUCHDB_PASSWORD = 'password'
const NPM_USERNAME = 'integration'
const NPM_PASSWORD = 'suchsecure'
const NPM_EMAIL = 'integration@test.com'

/**
 * Download the `npm-registry-docker` Docker image, create a new container and start it.
 */
async function startRegistry(): Promise<{
  container: Docker.Container
  url: string
}> {
  const docker = new Docker()

  await getStream(await docker.pull(IMAGE, {}))

  const container = await docker.createContainer({
    Tty: true,
    Image: IMAGE,
    HostConfig: {
      PortBindings: {
        [`${COUCHDB_PORT}/tcp`]: [{ HostPort: `${SERVER_PORT}` }],
      },
    },
    Env: [
      `COUCHDB_USER=${COUCHDB_USER}`,
      `COUCHDB_PASSWORD=${COUCHDB_PASSWORD}`,
    ],
  })

  await container.start()
  await delay(4000)

  try {
    // Wait for the registry to be ready
    await pRetry(
      () => got(`http://${SERVER_HOST}:${SERVER_PORT}/registry/_design/app`),
      {
        retries: 7,
        minTimeout: 1000,
        factor: 2,
      },
    )
  } catch (error) {
    throw new Error(`Couldn't start npm-registry-docker after 2 min`)
  }

  // Create user
  await got(
    `http://${SERVER_HOST}:${SERVER_PORT}/_users/org.couchdb.user:${NPM_USERNAME}`,
    {
      json: true,
      auth: `${COUCHDB_USER}:${COUCHDB_PASSWORD}`,
      method: 'PUT',
      body: {
        _id: `org.couchdb.user:${NPM_USERNAME}`,
        name: NPM_USERNAME,
        roles: [],
        type: 'user',
        password: NPM_PASSWORD,
        email: NPM_EMAIL,
      },
    },
  )

  const url = `http://${SERVER_HOST}:${SERVER_PORT}/registry/_design/app/_rewrite/`

  return { container, url }
}

async function stopRegistry(container: Docker.Container): Promise<void> {
  await container.stop()
  await container.remove()
}
