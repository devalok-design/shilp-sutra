/**
 * Bridge @typescript-eslint/rule-tester (which expects Mocha-shaped globals)
 * to Vitest's API. Without this the RuleTester throws at module load.
 */
import { RuleTester } from '@typescript-eslint/rule-tester'
import * as vitest from 'vitest'

RuleTester.afterAll = vitest.afterAll
RuleTester.it = vitest.it
RuleTester.itOnly = vitest.it.only
RuleTester.describe = vitest.describe
