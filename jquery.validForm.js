/*
Nom		:	jquery.validForm.js
Objet	:	Plugin jQuery
Remarque:	Plugin de validation des formulaires
Date	:	24/07/52012
Auteur	:	Nicolas CHAINTRON
Modification: 	
V1.0.0 	25/07/2012  N.CHAINTRON :	Première mise en service
V1.0.1	20/08/2012	N.CHAINTRON :	Renommage des classes CSS
*/
(function($) {
	String.prototype.formatReplace = function() {
	  var args = arguments;
	  return this.replace(/{(\d+)}/g, function(match, number) { 
		return typeof args[number] != 'undefined' ? args[number] : match;
	  });
	};
	var fonctions = {
		// Vérifie la validité d'une date au format francais dd/mm/yyyy
		isDate: function(sDate, dateNulleAutorisee) {
			var sSeparator = '/';
			if(dateNulleAutorisee != 'allowNull' && !sDate.match("^[0-9]{2}/[0-9]{2}/[0-9]{4}$")) return false;
			if(dateNulleAutorisee == 'allowNull' && sDate.match("^00/00/0000$")) return true;
			var arDate = sDate.split(sSeparator);
			var iDay = parseInt(arDate[0], 10);
			var iMonth = parseInt(arDate[1], 10);
			var iYear = parseInt(arDate[2], 10);
			var arDayPerMonth = [31,((iYear%4==0 && iYear%100!=0) || iYear%400==0)?29:28,31,30,31,30,31,31,30,31,30,31];
			if(!arDayPerMonth[iMonth-1]) return false;
			return (iDay <= arDayPerMonth[iMonth-1] && iDay > 0);		
		},
		isLeapYear: function(iYear) {
			return ((iYear%4==0 && iYear%100!=0) || iYear%400==0);
		},
		hasMinLength: function(expression, parametre) {
			return (expression.length < parametre) ? false:true;
		},
		hasMaxLength: function(expression, parametre) {
			return (expression.length > parametre) ? false:true;
		},
		isLowerThan: function(expression, parametre) {
			return (!isNaN(parseFloat(expression)) && isFinite(expression) && expression <= parametre) ? true : false;
		},
		isGreaterThan: function(expression, parametre) {
			return (!isNaN(parseFloat(expression)) && isFinite(expression) && expression >= parametre) ? true : false;
		}		
	};
	var methods = {
		init : function( options ) {
			// Si l'objet data validForm n'est pas défini, on le fait.
			if(!$(this).data('validForm')){
				// Définition des regles par défaut:
				$(this).data('validForm', {
					rules: {
						'.requis': {requis: true},
						'.entierPositif': {entierPositif: true},
						'.decimalPositif': {decimalPositif: true},
						'.email': {email: true},
						'.alphanumerique': {alphanumerique: true},
						'.frenchDate': {frenchDate: 'rejectNull'},
						'.alphanumeriqueEspaces': {alphanumeriqueEspaces: true},
						'.loginginger': {loginGinger: true}
					},
					predefinedRules: {
						requis: {type: 'regex', regex: /[^\s+$]/, message: 'Ce champ est obligatoire.'},
						entierPositif: {type: 'regex',  regex: /^\d+$/, message: 'Seul un nombre entier non signé est autorisé.'},
						decimalPositif: {type: 'regex',  regex: /^\d+(\.\d{1,2})?$/, message: 'Seul un nombre non signé à deux décimales maximum est autorisé.'},
						email: {type: 'regex', regex: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, message: 'Un email valide est requis.'},
						alphanumerique: {type: 'regex', regex: /^[A-Za-z_][A-Za-z\d_]*$/, message: 'Seule une valeur alphanumérique est autorisée.'},
						alphanumeriqueEspaces: {type: 'regex', regex: /^[A-Za-z_][A-Za-z\d_\s]*$/, message: 'Seule une valeur alphanumérique est autorisée.'},
						frenchDate: {type: 'fonction', fonction: 'isDate', message: 'Date invalide'},
						minLength: {type: 'fonction', fonction: 'hasMinLength', message: 'Le champ doit comporter au moins {0} caractères.'},
						maxLength: {type: 'fonction', fonction: 'hasMaxLength', message: 'Le champ doit comporter au maximum {0} caractères.'},
						valeurMin: {type: 'fonction', fonction: 'isGreaterThan', message: 'La valeur minimum exigée est {0}.'},
						valeurMax: {type: 'fonction', fonction: 'isLowerThan', message: 'La valeur maximum exigée est {0}.'},
						loginGinger: {type: 'regex', regex: /(^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)|(^[aA]\d{6}$)/, message: "L'identifiant n'a pas un format valide."}
					}
				});			
			}
			if (options && options.rules){
				$.extend($(this).data('validForm').rules, options.rules);
			}
			var formulaire = this;
			this.on('submit.validForm', function(e){
				// console.log(options);
				if(methods.validate.apply(this))
					return true;
				else {
					e.preventDefault();
					return false;
				}
			});
			var selImmediat = (options.immediat) ?  ':input' : ':input.validFormInputError';
			this.on('keyup change', selImmediat, function(e){
				methods.validate.apply(formulaire);
			});
		},
		destroy : function() {
			this.off('submit.validForm');
			return this;
		},
		checkRule: function (selecteur, nom, valeur, parametres){
			var elements = $(selecteur+":not(.validFormInputError)");
			var invalides = elements.filter(function() {
				switch(parametres.type){
					case 'regex':
					return this.value.match(parametres.regex);
					case 'fonction':
					return fonctions[parametres.fonction](this.value, valeur);
				}
			});
			elements.not(invalides).addClass("validFormInputError").parent().addClass('validFormTooltip').append('<span class="validFormMessage">' + parametres.message.formatReplace(valeur) + '</span>');
			return this;	
		},
		validate : function() {
			$(":input").removeClass("validFormInputError");
			$(".validFormTooltip").removeClass("validFormTooltip");
			$(".validFormMessage").remove();
			var predefinedRules = $(this).data('validForm').predefinedRules;
			$.each($(this).data('validForm').rules, function(selecteur, parametres){
				$.each(parametres, function(nom, valeur) {
					if (valeur)	methods.checkRule(selecteur, nom, valeur, predefinedRules[nom]);
				});
			});
			return($(".validFormInputError").length) ? false : true;
		},
		rules: function(options) {
			$.extend($(this).data('validForm').rules, options);
			return this;	
		},
		addMethod: function(options) {
			$.extend($(this).data('validForm').predefinedRules, options);
			return this;	
		}
	};
	$.fn.validForm = function( args ) {	//Déclaration du plugin dans l'objet fn jQuery
		// Récupération des arguments et définitions des parametres par défaut
		var settings = $.extend( {
			'debug': false
		}, args);
		if ( methods[args] ) {
			return methods[args].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof args === 'object' || ! args ) {
			// return methods.init.apply( this, arguments );
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  args + ' does not exist on jQuery.validForm' );
		}    
	};
})(jQuery);