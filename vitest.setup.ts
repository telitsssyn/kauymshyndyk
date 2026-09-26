// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// jsdom lacks HTMLDialogElement.showModal / close implementation
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.open = false
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}

if (typeof window !== 'undefined') {
  window.scrollTo = () => {}
}
