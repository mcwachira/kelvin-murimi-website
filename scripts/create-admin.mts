/**
 * One-time bootstrap: creates the single admin account via Better Auth.
 *
 * Usage:
 *   pnpm admin:create                          # against .env.local (local Docker Postgres)
 *   dotenv -e .env.production -- tsx scripts/create-admin.mts   # against Supabase
 *
 * Reads ADMIN_EMAIL from the environment (must match the value the app itself
 * uses to authorize the dashboard). Prompts for name/password interactively so
 * the password never ends up in shell history or a CI log.
 */
import { createInterface } from 'node:readline'
import { getAuth } from '../src/lib/auth.ts'

const rl = createInterface({ input: process.stdin, output: process.stdout })

function ask(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, (answer) => resolve(answer.trim())))
}

/** Prompts for input without echoing typed characters back to the terminal. */
function askHidden(query: string): Promise<string> {
  const rlInternal = rl as unknown as {
    _writeToOutput: (s: string) => void
    output: NodeJS.WritableStream
  }
  const originalWrite = rlInternal._writeToOutput.bind(rlInternal)
  let muted = false
  rlInternal._writeToOutput = (s: string) => {
    if (!muted) originalWrite(s)
  }
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rlInternal._writeToOutput = originalWrite
      process.stdout.write('\n')
      resolve(answer)
    })
    muted = true
  })
}

async function main() {
  const email = process.env.ADMIN_EMAIL
  if (!email) {
    console.error('ADMIN_EMAIL is not set. Add it to your .env file before running this.')
    process.exitCode = 1
    rl.close()
    return
  }

  console.log(`Creating the admin account for: ${email}`)
  const name = (await ask('Display name [Kelvin Murimi]: ')) || 'Kelvin Murimi'
  const password = await askHidden('Password (min 8 chars): ')
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.')
    process.exitCode = 1
    rl.close()
    return
  }
  const confirm = await askHidden('Confirm password: ')
  if (confirm !== password) {
    console.error('Passwords did not match.')
    process.exitCode = 1
    rl.close()
    return
  }

  try {
    await getAuth().api.signUpEmail({ body: { name, email, password } })
    console.log(`\nAdmin account created for ${email}. You can now sign in at /login.`)
  } catch (err) {
    console.error('\nFailed to create the admin account:')
    console.error(err instanceof Error ? err.message : err)
    console.error(
      "\nIf this says the user already exists, that's expected on a re-run — sign in normally instead.",
    )
    process.exitCode = 1
  }
  rl.close()
}

main()
