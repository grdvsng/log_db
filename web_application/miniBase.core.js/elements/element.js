/**
 * InnerElement - params for compiling elements
 * @typeDef InnerElement
 * @namespace
 * @property {String} clsName - dom element className
 * @property {String} tag - dom element tag name
 * @property {Array.<InnerElement>} items - child elements
 * @property {Array.<InnerElement>} fields - Only for forms, input InnerElement
 * @property {Array.<Array.<String>>} format -Only for Greed element, table declare
 * @property {Array.<Array.<String>>} prefill - Only for Greed element, table data
 * @property {Array.<Array.<String>>} rows - Only for Greed element, table row
 * @property {Boolean} keepScroll - move element with scrollY
 * @property {RegExp} re - Only for Validator, regexp for valid
 * @property {InnerElement} master - Only for Validator, element master
 * @property {Boolean} only_call - validator not render if not call
 * @property {String} message - Only for Validator, message when value not valid
 * @property {String} conformity - dom element className
 * @property {integer} [minlength=0] - Only for input elements, min value length
 */