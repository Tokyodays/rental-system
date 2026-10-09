import type { MessageCatalog } from './types'
import common from './common'
import landing from './landing'
import auth from './auth'
import dashboard from './dashboard'
import vehicles from './vehicles'
import rentals from './rentals'
import customers from './customers'
import history from './history'
import settings from './settings'

export * from './types'

export const messages: MessageCatalog = {
  ...common,
  ...landing,
  ...auth,
  ...dashboard,
  ...vehicles,
  ...rentals,
  ...customers,
  ...history,
  ...settings
}
