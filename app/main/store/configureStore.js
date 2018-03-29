import { createStore, applyMiddleware, Middleware } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from '../reducers'

const enhancer = applyMiddleware(thunk)

export default function configureStore(initialState) {
  return createStore(rootReducer, initialState, enhancer)
}
