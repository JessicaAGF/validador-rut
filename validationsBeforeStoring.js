const DWparameters = require('./DWValidationSettings');
const validator = require('validator');
const unirest = require('unirest');

exports.checkValues = function (DWInputValues) {
	return new Promise((resolve, reject) => {
		this.rutvalidoguia(DWInputValues.Values)
		.then(success => {
			if (!success) {
				throw new Error('Ingrese un RUT_GUÍA válido');
			}

			return success;
		})
		.then(success => this.rutvalidocliente(DWInputValues.Values))
		.then(success => {
			if (!success) {
				throw new Error('Ingrese un RUT_CLIENTE válido');
			}

			return success;
		})
		.then(success => this.foliovalido(DWInputValues.Values))
		.then(success => {
			if (!success) {
				throw new Error('Ingrese un folio entre 50000 y 80000');
			}

			return success;
		})
		.then(success => resolve(true))
		.catch(function (error){
			reject(error);
		})
	});
}


exports.getFieldValue = function (DWIndexFieldCollection, fieldName) {
	var field = DWIndexFieldCollection.find(x => x.FieldName == fieldName);
	if (field === undefined) {
		return;
	}

	return field.Item;
}

exports.foliovalido = function (DWFields) {
	var folio = this.getFieldValue(DWFields, 'FOLIO');
	return Promise.resolve(fvalidate(folio));
}

exports.rutvalidoguia = function (DWFields) {
	var rut = this.getFieldValue(DWFields, 'RUT_GUIA');
	return Promise.resolve(validate(rut));
}

exports.rutvalidocliente = function (DWFields) {
	var rut = this.getFieldValue(DWFields, 'RUT_CLIENTE');
	return Promise.resolve(validate(rut));
}

//
function fvalidate(folio){
	if (folio > 50000 & folio < 80000){
		return true;
	}
	return false;
}
function clean (rut) {
  return typeof rut === 'string'
    ? rut.replace(/^0+|[^0-9kK]+/g, '').toUpperCase()
    : ''
}

function validate (rut) {
  if (typeof rut !== 'string') {
    return false
  }

  // if it starts with 0 we return false
  // so a rut like 00000000-0 will not pass
  if (/^0+/.test(rut)) {
    return false
  }

  if (!/^0*(\d{1,3}(\.?\d{3})*)-?([\dkK])$/.test(rut)) {
    return false
  }

  rut = clean(rut)

  let t = parseInt(rut.slice(0, -1), 10)
  let m = 0
  let s = 1

  while (t > 0) {
    s = (s + (t % 10) * (9 - (m++ % 6))) % 11
    t = Math.floor(t / 10)
  }

  const v = s > 0 ? '' + (s - 1) : 'K'
  return v === rut.slice(-1)
}

function format (rut, options = {
  dots: true
}) {
  rut = clean(rut)

  let result
  if (options.dots) {
    result = rut.slice(-4, -1) + '-' + rut.substr(rut.length - 1)
    for (let i = 4; i < rut.length; i += 3) {
      result = rut.slice(-3 - i, -i) + '.' + result
    }
  } else {
    result = rut.slice(0, -1) + '-' + rut.substr(rut.length - 1)
  }

  return result
}

function getCheckDigit (input) {
  const rut = Array.from(clean(input), Number)

  if (rut.length === 0 || rut.includes(NaN)) {
    throw new Error(`"${input}" as RUT is invalid`)
  }

  const modulus = 11
  const initialValue = 0
  const sumResult = rut
    .reverse()
    .reduce(
      (accumulator, currentValue, index) =>
        accumulator + currentValue * ((index % 6) + 2),
      initialValue
    )

  const checkDigit = modulus - (sumResult % modulus)

  if (checkDigit === 10) {
    return 'K'
  } else if (checkDigit === 11) {
    return '0'
  } else {
    return checkDigit.toString()
  }
}
