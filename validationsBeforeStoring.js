const DWparameters = require('./DWValidationSettings');
const validator = require('validator');
const unirest = require('unirest');

exports.checkValues = function (DWInputValues) {
	return new Promise((resolve, reject) => {
		this.rutvalidoguía(DWInputValues.Values)
		.then(success => {
			if (!success) {
				throw new Error('Ingrese un RUT_GUÍA válido');
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

exports.rutvalidoguía = function (DWFields) {
	var rut = this.getFieldValue(DWFields, DWparameters.RUT_GUÍA);
	var Fn = {
	// Valida el rut con su cadena completa "XXXXXXXX-X"
	validaRut : function (rutCompleto) {
		rutCompleto = rutCompleto.replace('.', '');
		if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test( rutCompleto ))
			return false;
		var tmp 	= rutCompleto.split('-');
		var digv	= tmp[1];
		var rut 	= tmp[0];
		if ( digv == 'K' ) digv = 'k' ;
		return (Fn.dv(rut) == digv );
	},
	dv : function(T){
		var M=0,S=1;
		for(;T;T=Math.floor(T/10))
			S=(S+T%10*(9-M++%6))%11;
		return S?S-1:'k';
	}
};
	return Fn.validaRut(rut);
}
