/*
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Frank Schüler
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

de.titus.core.Namespace.create("de.titus.jstl.Constants", function() {
	de.titus.jstl.Constants = {};
	de.titus.jstl.Constants.EVENTS = {};
	de.titus.jstl.Constants.EVENTS.onLoad = "jstl-on-load";
	de.titus.jstl.Constants.EVENTS.onSuccess = "jstl-on-success";
	de.titus.jstl.Constants.EVENTS.onFail = "jstl-on-fail";
	de.titus.jstl.Constants.EVENTS.onReady = "jstl-on-ready";
	
});de.titus.core.Namespace.create("de.titus.jstl.FunctionRegistry", function() {	
	de.titus.jstl.FunctionRegistry = function(){
		this.functions = new Array();
	};
	
	de.titus.jstl.FunctionRegistry.prototype.add = function(aFunction){
		this.functions.push(aFunction);
	};
	
	
	de.titus.jstl.FunctionRegistry.getInstance = function(){
		if(de.titus.jstl.FunctionRegistry.INSTANCE == undefined){
			de.titus.jstl.FunctionRegistry.INSTANCE = new de.titus.jstl.FunctionRegistry();
		}
		
		return de.titus.jstl.FunctionRegistry.INSTANCE;
	};
	
});
de.titus.core.Namespace.create("de.titus.jstl.FunctionResult", function() {	
	de.titus.jstl.FunctionResult = function(runNextFunction, processChilds){
		this.runNextFunction = runNextFunction || runNextFunction == undefined;
		this.processChilds = processChilds || processChilds == undefined;
	};	
});
de.titus.core.Namespace.create("de.titus.jstl.IFunction", function() {	
	de.titus.jstl.IFunction = function(theAttributeName){
		this.attributeName = theAttributeName;	
	};
	
	de.titus.jstl.IFunction.prototype.run = /*de.titus.jstl.FunctionResult*/ function(aElement, aDataContext, aProcessor){return true;};
	
});
de.titus.core.Namespace.create("de.titus.jstl.functions.If", function() {	
	de.titus.jstl.functions.If = function(){};
	de.titus.jstl.functions.If.prototype = new de.titus.jstl.IFunction("if");
	de.titus.jstl.functions.If.prototype.constructor = de.titus.jstl.functions.If;
	
	/****************************************************************
	 * static variables
	 ***************************************************************/
	de.titus.jstl.functions.If.LOGGER = de.titus.logging.LoggerFactory.getInstance().newLogger("de.titus.jstl.functions.If");
	
	
	de.titus.jstl.functions.If.prototype.run = /*boolean*/function(aElement, aDataContext, aProcessor){
		if(de.titus.jstl.functions.If.LOGGER.isDebugEnabled())
			de.titus.jstl.functions.If.LOGGER.logDebug("execute run(" + aElement + ", " + aDataContext + ", " + aProcessor + ")");
		
		
		var processor = aProcessor || new de.titus.jstl.Processor();
		var expressionResolver = processor.expressionResolver || new de.titus.core.ExpressionResolver();
		
		var expression = aElement.attr(processor.config.attributePrefix + this.attributeName);
		if(expression != undefined){
			var expressionResult = expressionResolver.resolveExpression(expression, aDataContext, false);
			if(typeof expressionResult === "function")
				expressionResult = expressionResult(aElement, aDataContext, aProcessor);
			
			
			expressionResult = expressionResult == true || expressionResult == "true";
			if(!expressionResult){
				aElement.remove();
				return new de.titus.jstl.FunctionResult(false, false);
			}
		}
		
		return new de.titus.jstl.FunctionResult(true, true);
	};
	
});
de.titus.core.Namespace.create("de.titus.jstl.functions.Choose", function() {
	de.titus.jstl.functions.Choose = function() {
	};
	de.titus.jstl.functions.Choose.prototype = new de.titus.jstl.IFunction("choose");
	de.titus.jstl.functions.Choose.prototype.constructor = de.titus.jstl.functions.Choose;
	
	/***************************************************************************
	 * static variables
	 **************************************************************************/
	de.titus.jstl.functions.Choose.LOGGER = de.titus.logging.LoggerFactory.getInstance().newLogger("de.titus.jstl.functions.Choose");
	
	/***************************************************************************
	 * functions
	 **************************************************************************/
	de.titus.jstl.functions.Choose.prototype.run = function(aElement, aDataContext, aProcessor) {
		if (de.titus.jstl.functions.Choose.LOGGER.isDebugEnabled())
			de.titus.jstl.functions.Choose.LOGGER.logDebug("execute run(" + aElement + ", " + aDataContext + ", " + aProcessor + ")");
		
		var processor = aProcessor || new de.titus.jstl.Processor();
		var expressionResolver = processor.expressionResolver || new de.titus.core.ExpressionResolver();
		
		var expression = aElement.attr(processor.config.attributePrefix + this.attributeName);
		if (expression != undefined) {
			
			this.processChilds(aElement, aDataContext, processor, expressionResolver);
			return new de.titus.jstl.FunctionResult(true, true);
		}		
		return new de.titus.jstl.FunctionResult(true, true);
	};
	
	de.titus.jstl.functions.Choose.prototype.processChilds = function(aChooseElement, aDataContext, aProcessor, aExpressionResolver) {
		if (de.titus.jstl.functions.Choose.LOGGER.isDebugEnabled())
			de.titus.jstl.functions.Choose.LOGGER.logDebug("execute processChilds(" + aChooseElement + ", " + aDataContext + ", " + aProcessor + ", " + aExpressionResolver + ")");
		
		var childs = aChooseElement.children();
		var resolved = false;
		var $__THIS__$ = this;
		childs.each(function() {			
			var child = $(this);
			if (!resolved && $__THIS__$.processChild(aChooseElement, child, aDataContext, aProcessor, aExpressionResolver)) {
				if (de.titus.jstl.functions.Choose.LOGGER.isTraceEnabled())
					de.titus.jstl.functions.Choose.LOGGER.logTrace("compute child: " + child);
				resolved = true;
			} else {
				if (de.titus.jstl.functions.Choose.LOGGER.isTraceEnabled())
					de.titus.jstl.functions.Choose.LOGGER.logTrace("remove child: " + child);
				child.remove();
			}
		});
	};
	
	de.titus.jstl.functions.Choose.prototype.processChild = function(aChooseElement, aElement, aDataContext, aProcessor, aExpressionResolver) {
		if (de.titus.jstl.functions.Choose.LOGGER.isDebugEnabled())
			de.titus.jstl.functions.Choose.LOGGER.logDebug("execute processChild(" + aChooseElement + ", " + aElement + ", " + aDataContext + ", " + aProcessor + ", " + aExpressionResolver + ")");
		
		if (this.processWhenElement(aChooseElement, aElement, aDataContext, aProcessor, aExpressionResolver)) {
			return true;
		} else if (this.processOtherwiseElement(aChooseElement, aElement, aDataContext, aProcessor, aExpressionResolver)) {
			return true;
		} else {
			return false;
		}
	};
	
	de.titus.jstl.functions.Choose.prototype.processWhenElement = function(aChooseElement, aElement, aDataContext, aProcessor, aExpressionResolver) {
		if (de.titus.jstl.functions.Choose.LOGGER.isDebugEnabled())
			de.titus.jstl.functions.Choose.LOGGER.logDebug("execute processWhenElement(" + aChooseElement + ", " + aElement + ", " + aDataContext + ", " + aProcessor + ", " + aExpressionResolver + ")");
		
		var expression = aElement.attr(aProcessor.config.attributePrefix + 'when');
		if (expression != undefined) {
			return aExpressionResolver.resolveExpression(expression, aDataContext, false);
		}
		return false;
	};
	
	de.titus.jstl.functions.Choose.prototype.processOtherwiseElement = function(aChooseElement, aElement, aDataContext, aProcessor, aExpressionResolver) {
		if (de.titus.jstl.functions.Choose.LOGGER.isDebugEnabled())
			de.titus.jstl.functions.Choose.LOGGER.logDebug("execute processOtherwiseElement(" + aChooseElement + ", " + aElement + ", " + aDataContext + ", " + aProcessor + ", " + aExpressionResolver + ")");
		
		var expression = aElement.attr(aProcessor.config.attributePrefix + 'otherwise');
		if (expression != undefined) {
			return true;
		}
		return false;
	};
	
});
de.titus.core.Namespace.create("de.titus.jstl.functions.Foreach", function() {
	de.titus.jstl.functions.Foreach = function() {
	};
	de.titus.jstl.functions.Foreach.prototype = new de.titus.jstl.IFunction("foreach");
	de.titus.jstl.functions.Foreach.prototype.constructor = de.titus.jstl.functions.Foreach;
	
	/***************************************************************************
	 * static variables
	 **************************************************************************/
	de.titus.jstl.functions.Foreach.LOGGER = de.titus.logging.LoggerFactory.getInstance().newLogger("de.titus.jstl.functions.Foreach");
	
	/***************************************************************************
	 * functions
	 **************************************************************************/
	
	de.titus.jstl.functions.Foreach.prototype.run = function(aElement, aDataContext, aProcessor) {
		if (de.titus.jstl.functions.Foreach.LOGGER.isDebugEnabled())
			de.titus.jstl.functions.Foreach.LOGGER.logDebug("execute run(" + aElement + ", " + aDataContext + ", " + aProcessor + ")");
		
		var processor = aProcessor || new de.titus.jstl.Processor();
		var expressionResolver = processor.expressionResolver || new de.titus.core.ExpressionResolver();
		
		var expression = aElement.attr(processor.config.attributePrefix + this.attributeName);
		if (expression != undefined) {
			this.internalProcession(expression, aElement, aDataContext, processor, expressionResolver);
			return new de.titus.jstl.FunctionResult(false, false);
		}
		return new de.titus.jstl.FunctionResult(true, true);
	};
	
	de.titus.jstl.functions.Foreach.prototype.internalProcession = function(aExpression, aElement, aDataContext, aProcessor, anExpressionResolver) {
		if (de.titus.jstl.functions.Foreach.LOGGER.isDebugEnabled())
			de.titus.jstl.functions.Foreach.LOGGER.logDebug("execute processList(" + aElement + ", " + aDataContext + ", " + aProcessor + ", " + anExpressionResolver + ")");
		
		var tempalte = this.getRepeatableContent(aElement);
		aElement.empty();
		if (tempalte == undefined)
			return;
		
		var varName = this.getVarname(aElement, aProcessor);
		var statusName = this.getStatusName(aElement, aProcessor);
		var list = undefined;
		if (aExpression == "") {
			de.titus.jstl.functions.Foreach.LOGGER.logWarn("No list data specified. Using the data context!");
			list = aDataContext;
		} else
			list = anExpressionResolver.resolveExpression(aExpression, aDataContext, new Array());
		
		var breakCondition = aElement.attr(aProcessor.config.attributePrefix + this.attributeName + "-break-condition");
		if (list != undefined && (typeof list === "array" || list.length != undefined)) {
			this.processList(list, tempalte, varName, statusName, breakCondition, aElement, aDataContext, aProcessor, anExpressionResolver);
		} else if (list != undefined) {
			this.processMap(list, tempalte, varName, statusName, breakCondition, aElement, aDataContext, aProcessor, anExpressionResolver);
		}
	};
	
	de.titus.jstl.functions.Foreach.prototype.processList = function(aListData, aTemplate, aVarname, aStatusName, aBreakCondition, aElement, aDataContext, aProcessor, anExpressionResolver) {
		if (aListData == undefined || aListData.length == undefined || aListData.length < 1)
			return;
		
		var startIndex = aElement.attr(aProcessor.config.attributePrefix + this.attributeName + "-start-index") || 0;
		startIndex = anExpressionResolver.resolveExpression(startIndex, aDataContext, 0) || 0;
		for (var i = startIndex; i < aListData.length; i++) {
			var newContent = $("<div>").html(aTemplate);
			var newContext = jQuery.extend({}, aDataContext);
			newContext[aVarname] = aListData[i];
			newContext[aStatusName] = {
			"index" : i,
			"number" : (i + 1),
			"count" : aListData.length,
			"data" : aListData,
			"context" : aDataContext
			};
			if (aBreakCondition != undefined && this.processBreakCondition(newContext, aBreakCondition, aElement, aProcessor)) {
				return;
			}
			
			this.processNewContent(newContent, newContext, aElement, aProcessor);
			newContext[aVarname] = undefined;
			newContext[aStatusName] = undefined;
		}
	};
	
	de.titus.jstl.functions.Foreach.prototype.processMap = function(aMap, aTemplate, aVarname, aStatusName, aBreakCondition, aElement, aDataContext, aProcessor, anExpressionResolver) {
		var count = 0;
		for ( var name in aMap)
			count++;
		
		var i = 0;
		for ( var name in aMap) {
			var newContent = $("<div>").html(aTemplate);
			var newContext = jQuery.extend({}, aDataContext);
			newContext[aVarname] = aMap[name];
			newContext[aStatusName] = {
			"index" : i,
			"number" : (i + 1),
			"key": name,
			"count" : count,
			"data" : aMap,
			"context" : aDataContext
			};
			
			if (aBreakCondition != undefined && this.processBreakCondition(newContext, aBreakCondition, aElement, aProcessor)) {
				return;
			}
			
			i++;
			this.processNewContent(newContent, newContext, aElement, aProcessor);
			newContext[aVarname] = undefined;
			newContext[aStatusName] = undefined;
		}
	};
	
	de.titus.jstl.functions.Foreach.prototype.processBreakCondition = function(aContext, aBreakCondition, aElement, aProcessor) {
		var expressionResolver = aProcessor.expressionResolver || new de.titus.jstl.ExpressionResolver();
		var expressionResult = expressionResolver.resolveExpression(aBreakCondition, aContext, false);
		if (typeof expressionResult === "function")
			expressionResult = expressionResult(aElement, aContext, aProcessor);
		
		return expressionResult == true || expressionResult == "true";
	};
	
	de.titus.jstl.functions.Foreach.prototype.processNewContent = function(aNewContent, aNewContext, aElement, aProcessor) {		
		aProcessor.compute(	aNewContent, aNewContext);
		aElement.append(aNewContent.contents());
	};
	
	de.titus.jstl.functions.Foreach.prototype.getVarname = function(aElement, aProcessor) {
		var varname = aElement.attr(aProcessor.config.attributePrefix + this.attributeName + "-var");
		if (varname == undefined)
			return "itemVar";
		
		return varname;
	};
	
	de.titus.jstl.functions.Foreach.prototype.getStatusName = function(aElement, aProcessor) {
		var statusName = aElement.attr(aProcessor.config.attributePrefix + this.attributeName + "-status");
		if (statusName == undefined)
			return "statusVar";
		
		return statusName;
	};
	
	de.titus.jstl.functions.Foreach.prototype.getRepeatableContent = function(aElement) {
		return aElement.html();
	};
});
de.titus.core.Namespace.create("de.titus.jstl.functions.TextContent", function() {
	de.titus.jstl.functions.TextContent = function() {
	};
	de.titus.jstl.functions.TextContent.prototype = new de.titus.jstl.IFunction();
	de.titus.jstl.functions.TextContent.prototype.constructor = de.titus.jstl.functions.TextContent;
	
	/**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************
	 * static variables
	 *********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
	de.titus.jstl.functions.TextContent.LOGGER = de.titus.logging.LoggerFactory.getInstance().newLogger("de.titus.jstl.functions.TextContent");
	
	/**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************
	 * functions
	 *********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
	de.titus.jstl.functions.TextContent.prototype.run = function(aElement, aDataContext, aProcessor) {
		if (de.titus.jstl.functions.TextContent.LOGGER.isDebugEnabled())
			de.titus.jstl.functions.TextContent.LOGGER.logDebug("execute run(" + aElement + ", " + aDataContext + ", " + aProcessor + ")");
		
		var processor = aProcessor || new de.titus.jstl.Processor();
		var expressionResolver = processor.expressionResolver || new de.titus.core.ExpressionResolver();
		var ignore = aElement.attr(processor.config.attributePrefix + "text-ignore");
		
		if (ignore != true || ignore != "true") {
			aElement.contents().filter(function() {
				return this.nodeType === 3 && this.textContent != undefined && this.textContent.trim() != "";
			}).each(function() {
				var contenttype = aElement.attr(processor.config.attributePrefix + "text-content-type") || "text";
				var node = this;
				var text = node.textContent;

				text = expressionResolver.resolveText(text, aDataContext);
				var contentFunction = de.titus.jstl.functions.TextContent.CONTENTTYPE[contenttype];
				if (contentFunction)
					contentFunction(node, text, aElement, processor, aDataContext);
			});
		}
		
		return new de.titus.jstl.FunctionResult(true, true);
	};
	de.titus.jstl.functions.TextContent.CONTENTTYPE = {};
	de.titus.jstl.functions.TextContent.CONTENTTYPE["html"] = function(aNode, aText, aBaseElement, aProcessor, aDataContext) {
		$(aNode).replaceWith($(aText));
	};
	de.titus.jstl.functions.TextContent.CONTENTTYPE["text/html"] = de.titus.jstl.functions.TextContent.CONTENTTYPE["html"];
	
	de.titus.jstl.functions.TextContent.CONTENTTYPE["json"] = function(aNode, aText, aBaseElement, aProcessor, aDataContext) {
		if (typeof aText === "string")
			aNode.textContent = aText;
		else
			aNode.textContent = JSON.stringify(aText);
	};
	de.titus.jstl.functions.TextContent.CONTENTTYPE["application/json"] = de.titus.jstl.functions.TextContent.CONTENTTYPE["json"];
	
	de.titus.jstl.functions.TextContent.CONTENTTYPE["text"] = function(aNode, aText, aBaseElement, aProcessor, aDataContext) {
		var text = aText;
		var addAsHtml = false;
		
		var trimLength = aBaseElement.attr(aProcessor.config.attributePrefix + "text-trim-length");
		if (trimLength != undefined && trimLength != "") {
			trimLength = aProcessor.expressionResolver.resolveExpression(trimLength, aDataContext, "-1");
			trimLength = parseInt(trimLength);
			if (trimLength && trimLength > 0)
				text = de.titus.core.StringUtils.trimTextLength(text, trimLength);
		}
		
		var preventformat = aBaseElement.attr(aProcessor.config.attributePrefix + "text-prevent-format");
		if (preventformat != undefined && preventformat != "false") {
			preventformat = aProcessor.expressionResolver.resolveExpression(preventformat, aDataContext, true);
			if (preventformat == "true" || preventformat == true) {
				text = de.titus.core.StringUtils.formatToHtml(text);
				addAsHtml = true;
			}
		}
		
		if (addAsHtml)
			$(aNode).replaceWith(text);
		else
			aNode.textContent = aText;
	};
	de.titus.jstl.functions.TextContent.CONTENTTYPE["text/plain"] = de.titus.jstl.functions.TextContent.CONTENTTYPE["text"];
});
de.titus.core.Namespace.create("de.titus.jstl.functions.AttributeContent", function() {
	de.titus.jstl.functions.AttributeContent = function() {
	};
	de.titus.jstl.functions.AttributeContent.prototype = new de.titus.jstl.IFunction();
	de.titus.jstl.functions.AttributeContent.prototype.constructor = de.titus.jstl.functions.AttributeContent;
	
	/***************************************************************************
	 * static variables
	 **************************************************************************/
	de.titus.jstl.functions.AttributeContent.LOGGER = de.titus.logging.LoggerFactory.getInstance().newLogger("de.titus.jstl.functions.AttributeContent");
	
	/***************************************************************************
	 * functions
	 **************************************************************************/
	
	de.titus.jstl.functions.AttributeContent.prototype.run = function(aElement, aDataContext, aProcessor) {
		if (de.titus.jstl.functions.AttributeContent.LOGGER.isDebugEnabled())
			de.titus.jstl.functions.AttributeContent.LOGGER.logDebug("execute run(" + aElement + ", " + aDataContext + ", " + aProcessor + ")");
		
		var processor = aProcessor || new de.titus.jstl.Processor();
		var expressionResolver = processor.expressionResolver || new de.titus.core.ExpressionResolver();
		if (aElement.length == 1) {
			var attributes = aElement[0].attributes || [];
			for (var i = 0; i< attributes.length; i++) {
				var name = attributes[i].name;				
				if (name.indexOf(processor.config.attributePrefix) != 0) {
					var value = attributes[i].value;
					if (value != undefined && value != null && value != "" && value != "null") {
						try {
							var newValue = expressionResolver.resolveText(value, aDataContext);
							if (value != newValue) {
								if (de.titus.jstl.functions.AttributeContent.LOGGER.isDebugEnabled()) {
									de.titus.jstl.functions.AttributeContent.LOGGER.logDebug("Change attribute \"" + name + "\" from \"" + value + "\" to \"" + newValue + "\"!");
								}
								aElement.attr(name, newValue);
							}
						} catch (e) {
							de.titus.jstl.functions.AttributeContent.LOGGER.logError("Can't process attribute\"" + name + "\" with value \"" + value + "\"!");
						}
					}
				}
			}
		}
		
		return new de.titus.jstl.FunctionResult(true, true);
	};
	
});
de.titus.core.Namespace.create("de.titus.jstl.functions.Data", function() {
	de.titus.jstl.functions.Data = function() {
	};
	de.titus.jstl.functions.Data.prototype = new de.titus.jstl.IFunction("data");
	de.titus.jstl.functions.Data.prototype.constructor = de.titus.jstl.functions.Data;
	
	/**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************
	 * static variables
	 *********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
	de.titus.jstl.functions.Data.LOGGER = de.titus.logging.LoggerFactory.getInstance().newLogger("de.titus.jstl.functions.Data");
	
	/**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************
	 * functions
	 *********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
	
	de.titus.jstl.functions.Data.prototype.run = function(aElement, aDataContext, aProcessor) {
		if (de.titus.jstl.functions.Data.LOGGER.isDebugEnabled())
			de.titus.jstl.functions.Data.LOGGER.logDebug("execute run(" + aElement + ", " + aDataContext + ", " + aProcessor + ")");
		
		var processor = aProcessor || new de.titus.jstl.Processor();
		var expressionResolver = processor.expressionResolver || new de.titus.core.ExpressionResolver();
		
		var expression = aElement.attr(processor.config.attributePrefix + this.attributeName);
		if (expression != undefined) {
			this.internalProcessing(expression, aElement, aDataContext, processor, expressionResolver);
		}
		
		return new de.titus.jstl.FunctionResult(true, true);
	};
	
	de.titus.jstl.functions.Data.prototype.internalProcessing = function(anExpression, aElement, aDataContext, aProcessor, anExpressionResolver) {
		var varname = this.getVarname(aElement, aDataContext, aProcessor, anExpressionResolver);
		var mode = this.getMode(aElement, aProcessor, anExpressionResolver);
		if (this[mode] != undefined && typeof this[mode] === "function")
			this[mode].call(this, anExpression, aElement, varname, aDataContext, aProcessor, anExpressionResolver);
		else
			this["direct"].call(this, anExpression, aElement, varname, aDataContext, aProcessor, anExpressionResolver);
	};
	
	de.titus.jstl.functions.Data.prototype.getOptions = function(aElement, aDataContext, aProcessor, anExpressionResolver) {
		var options = aElement.attr(aProcessor.config.attributePrefix + this.attributeName + "-options");
		if (options != undefined) {
			options = anExpressionResolver.resolveText(options, aDataContext);
			options = anExpressionResolver.resolveExpression(options, aDataContext);
			return options || {};
		}
		
		return {};
	};
	
	de.titus.jstl.functions.Data.prototype.getMode = function(aElement, aProcessor, anExpressionResolver) {
		return aElement.attr(aProcessor.config.attributePrefix + this.attributeName + "-mode") || "direct";
	};
	
	de.titus.jstl.functions.Data.prototype.getVarname = function(aElement, aDataContext, aProcessor, anExpressionResolver) {
		return aElement.attr(aProcessor.config.attributePrefix + this.attributeName + "-var");
	};
	
	de.titus.jstl.functions.Data.prototype["direct"] = function(anExpression, aElement, aVarname, aDataContext, aProcessor, anExpressionResolver) {
		var newData = anExpressionResolver.resolveExpression(anExpression, aDataContext);
		this.addNewData(newData, aVarname, aDataContext, aProcessor, anExpressionResolver);
	};
	
	de.titus.jstl.functions.Data.prototype["remote"] = function(anExpression, aElement, aVarname, aDataContext, aProcessor, anExpressionResolver) {		
		var $__THIS__$ = this;		
		var url = anExpressionResolver.resolveText(anExpression, aDataContext);
		var option = this.getOptions(aElement, aDataContext, aProcessor, anExpressionResolver);
		
		var ajaxSettings = {
		'url' : de.titus.core.Page.getInstance().buildUrl(url),
		'async' : false,
		'cache' : false,
		'dataType' : "json"
		};
		ajaxSettings = $.extend(ajaxSettings, option);
		ajaxSettings.success = function(newData) {
			$__THIS__$.addNewData(newData, aVarname, aDataContext, aProcessor, anExpressionResolver);
		};
		
		$.ajax(ajaxSettings);
	};
	
	de.titus.jstl.functions.Data.prototype["url-parameter"] = function(anExpression, aElement, aVarname, aDataContext, aProcessor, anExpressionResolver) {
		var parameterName = anExpressionResolver.resolveText(anExpression, aDataContext);
		var value = de.titus.core.Page.getInstance().getUrl().getParameter(parameterName);
		this.addNewData(value, aVarname, aDataContext, aProcessor, anExpressionResolver);
	};
	
	de.titus.jstl.functions.Data.prototype.addNewData = function(aNewData, aVarname, aDataContext, aProcessor, anExpressionResolver) {
		if (de.titus.jstl.functions.Data.LOGGER.isDebugEnabled())
			de.titus.jstl.functions.Data.LOGGER.logDebug("execute addNewData(" + aNewData + ", " + aVarname + ", " + aDataContext + ", " + aProcessor + ", " + anExpressionResolver + ")");
		if (aVarname == undefined) {
			$.extend(true, aDataContext, aNewData);
		} else {
			aDataContext[aVarname] = aNewData;
		}
	};
});
de.titus.core.Namespace.create("de.titus.jstl.functions.Include", function() {
	de.titus.jstl.functions.Include = function() {
		this.cache = {};
	};
	de.titus.jstl.functions.Include.prototype = new de.titus.jstl.IFunction("include");
	de.titus.jstl.functions.Include.prototype.constructor = de.titus.jstl.functions.Include;
	
	/***************************************************************************
	 * static variables
	 **************************************************************************/
	de.titus.jstl.functions.Include.LOGGER = de.titus.logging.LoggerFactory.getInstance().newLogger("de.titus.jstl.functions.Include");
	
	/***************************************************************************
	 * functions
	 **************************************************************************/
	
	de.titus.jstl.functions.Include.prototype.run = function(aElement, aDataContext, aProcessor) {
		if (de.titus.jstl.functions.Include.LOGGER.isDebugEnabled())
			de.titus.jstl.functions.Include.LOGGER.logDebug("execute run(" + aElement + ", " + aDataContext + ", " + aProcessor + ")");
		
		var processor = aProcessor || new de.titus.jstl.Processor();
		var expressionResolver = processor.expressionResolver || new de.titus.jstl.ExpressionResolver();
		
		var expression = aElement.attr(processor.config.attributePrefix + this.attributeName);
		if (expression != undefined) {
			this.internalProcessing(expression, aElement, aDataContext, processor, expressionResolver);
		}
		return new de.titus.jstl.FunctionResult(true, true);
	};
	
	de.titus.jstl.functions.Include.prototype.internalProcessing = function(anIncludeExpression, aElement, aDataContext, aProcessor, anExpressionResolver) {
		var url = anExpressionResolver.resolveText(anIncludeExpression, aDataContext);
		var disableCaching = url.indexOf("?") >= 0 || aElement.attr(aProcessor.config.attributePrefix + this.attributeName + "-cache-disabled") != undefined;
		var content = "";
		if (!disableCaching)
			content = this.cache[url];
		
		var includeMode = this.getIncludeMode(aElement, aDataContext, aProcessor, anExpressionResolver);
		if (content)
			this.addHtml(aElement, content, includeMode);
		else {
			var options = this.getOptions(aElement, aDataContext, aProcessor, anExpressionResolver);
			var ajaxSettings = {
			'url' : de.titus.core.Page.getInstance().buildUrl(url),
			'async' : false,
			'cache' : aElement.attr(aProcessor.config.attributePrefix + this.attributeName + "-ajax-cache-disabled") == undefined,
			"dataType" : "html"
			};
			ajaxSettings = $.extend(true, ajaxSettings, options);
			
			var $__this__$ = this;
			ajaxSettings.success = function(template) {
				$__this__$.cache[url] = template;
				$__this__$.addHtml(aElement, template, includeMode);
			};
			
			ajaxSettings.error = function(error) {
				throw JSON.stringify(error);
			};
			$.ajax(ajaxSettings)
		}
	};
	
	de.titus.jstl.functions.Include.prototype.getOptions = function(aElement, aDataContext, aProcessor, anExpressionResolver) {
		var options = aElement.attr(aProcessor.config.attributePrefix + this.attributeName + "-options");
		if (options != undefined) {
			options = anExpressionResolver.resolveText(options, aDataContext);
			options = anExpressionResolver.resolveExpression(options, aDataContext);
			return options || {};
		}
		
		return {};
	};
	
	de.titus.jstl.functions.Include.prototype.getIncludeMode = function(aElement, aDataContext, aProcessor, anExpressionResolver) {
		var mode = aElement.attr(aProcessor.config.attributePrefix + this.attributeName + "-mode");
		if (mode == undefined)
			return "replace";
		
		mode = mode.toLowerCase();
		if (mode == "append" || mode == "replace" || mode == "prepend")
			return mode;
		
		return "replace";
	};
	
	de.titus.jstl.functions.Include.prototype.addHtml = function(aElement, aTemplate, aIncludeMode) {
		if (de.titus.jstl.functions.Include.LOGGER.isDebugEnabled())
			de.titus.jstl.functions.Include.LOGGER.logDebug("execute addHtml(" + aElement + ", " + aTemplate + ", " + aIncludeMode + ")");
		if (aIncludeMode == "replace")
			aElement.html(aTemplate);
		else if (aIncludeMode == "append")
			aElement.append(aTemplate);
		else if (aIncludeMode == "prepend")
			aElement.prepend(aTemplate);
		else
			aElement.html(aTemplate);
		
	};
	
});
de.titus.core.Namespace.create("de.titus.jstl.functions.AddAttribute", function() {
	de.titus.jstl.functions.AddAttribute = function() {
	};
	de.titus.jstl.functions.AddAttribute.prototype = new de.titus.jstl.IFunction("add-attribute");
	de.titus.jstl.functions.AddAttribute.prototype.constructor = de.titus.jstl.functions.AddAttribute;
	
	/***************************************************************************
	 * static variables
	 **************************************************************************/
	de.titus.jstl.functions.AddAttribute.LOGGER = de.titus.logging.LoggerFactory.getInstance().newLogger("de.titus.jstl.functions.AddAttribute");
	
	/***************************************************************************
	 * functions
	 **************************************************************************/
	
	de.titus.jstl.functions.AddAttribute.prototype.run = function(aElement, aDataContext, aProcessor) {
		if (de.titus.jstl.functions.AddAttribute.LOGGER.isDebugEnabled())
			de.titus.jstl.functions.AddAttribute.LOGGER.logDebug("execute run(" + aElement + ", " + aDataContext + ", " + aProcessor + ")");
		
		var processor = aProcessor || new de.titus.jstl.Processor();
		var expressionResolver = processor.expressionResolver || new de.titus.core.ExpressionResolver();
		
		var expression = aElement.attr(processor.config.attributePrefix + this.attributeName);
		if (expression != undefined) {
			
			var expressionResult = expressionResolver.resolveExpression(expression, aDataContext, false);
			
			if (expressionResult != undefined && typeof expressionResult === "function")
				expressionResult = expressionResult(aElement, aDataContext, aProcessor);			
			else if (expressionResult != undefined && typeof expressionResult === "array")
				this.processArray(expressionResult, aElement, aDataContext, processor);
			else
				this.processObject(expressionResult, aElement, aDataContext, processor);
		}
		
		return new de.titus.jstl.FunctionResult(true, true);
	};
	
	de.titus.jstl.functions.AddAttribute.prototype.processArray = function(theDataArray, aElement, aDataContext, aProcessor) {
		for (var i = 0; i < theDataArray.length; i++) {
			this.processObject(theDataArray[i], aElement, aDataContext, aProcessor);
		}
	};
	
	de.titus.jstl.functions.AddAttribute.prototype.processObject = function(theData, aElement, aDataContext, aProcessor) {
		if (theData.name != undefined) {
			aElement.attr(theData.name, theData.value);
		} else {
			de.titus.jstl.functions.AddAttribute.LOGGER.logError("run processObject (" + theData + ", " + aElement + ", " + aDataContext + ", " + aProcessor + ") -> No attribute name defined!");
		}
	};
	
});
(function($) {
	de.titus.core.Namespace.create("de.titus.jstl.Processor", function() {
		
		/**
		 * <code>
		 * config: {
		 * "element": element,
		 * "data": dataContext,
		 * "expressionRegex": expressionRegex,
		 * "onLoad": function(){},
		 * "onSuccess":function(){},
		 * "onFail": function(){},
		 * "attributePrefix" : "jstl-" 
		 * }
		 * </code>
		 */
		de.titus.jstl.Processor = function(aConfig) {
			
			this.config = {
			"element" : undefined,
			"data" : {},
			"attributePrefix" : "jstl-",
			"expressionRegex" : undefined
			};
			
			this.config = $.extend(true, this.config, aConfig);
			var expressionRegex = this.config.element.attr(this.config.attributePrefix + "expression-regex");
			if (expressionRegex != undefined && expressionRegex != "")
				this.config.expressionRegex = expressionRegex;
			
			this.expressionResolver = new de.titus.core.ExpressionResolver(this.config.expressionRegex);
			
			this.onReadyEvent = new Array();
		};
		
		/***********************************************************************
		 * static variables
		 **********************************************************************/
		de.titus.jstl.Processor.LOGGER = de.titus.logging.LoggerFactory.getInstance().newLogger("de.titus.jstl.Processor");
		
		/***********************************************************************
		 * functions
		 **********************************************************************/
		
		de.titus.jstl.Processor.prototype.compute = /* boolean */function(aElement, aDataContext) {
			if (de.titus.jstl.Processor.LOGGER.isDebugEnabled())
				de.titus.jstl.Processor.LOGGER.logDebug("execute compute(" + (aElement != undefined ? aElement.prop("tagName") : aElement) + ", " + aDataContext + ")");
			if (aElement == undefined)
				return this.internalComputeRoot();
			
			if (!this.isElementProcessable(aElement)) {
				return true;
			}
			
			var events = this.getEvents(aElement) || {};
			return this.internalComputeElement(aElement, aDataContext, events, false);
		};
		
		de.titus.jstl.Processor.prototype.internalComputeRoot = /* boolean */function() {
			var events = this.getEvents(this.config.element) || {};
			if (this.config.onLoad)
				events.onLoad = this.config.onLoad;
			if (this.config.onSuccess)
				events.onSuccess = this.config.onSuccess;
			if (this.config.onFail)
				events.onFail = this.config.onFail;
			return this.internalComputeElement(this.config.element, this.config.data, events, true);
		};
		
		de.titus.jstl.Processor.prototype.internalComputeElement = /* boolean */function(aElement, aDataContext, theEvents, isRoot) {
			var dataContext = aDataContext || this.config.data;
			if (!isRoot) {
				var ignore = aElement.attr(this.config.attributePrefix + "ignore");
				if (ignore != undefined && ignore != "")
					ignore = de.titus.core.SpecialFunctions.doEvalWithContext(ignore, aDataContext, false);
				
				if (ignore == true || ignore == "true") {
					return true;
				}
			}
			
			if (theEvents.onLoad != undefined && typeof theEvents.onLoad === "function")
				theEvents.onLoad(aElement, aDataContext, this);
			aElement.trigger(de.titus.jstl.Constants.EVENTS.onLoad, aDataContext);
			
			var processResult = true;
			var result = this.internalExecuteFunction(aElement, dataContext);
			if (result.processChilds) {
				
				var ignoreChilds = aElement.attr(this.config.attributePrefix + "ignore-childs");
				if (ignoreChilds != undefined && ignoreChilds != "")
					ignoreChilds = de.titus.core.SpecialFunctions.doEvalWithContext(ignoreChilds, aDataContext, true);
				else if(ignoreChilds == "")
					ignoreChilds = true;
				else {
					var childprocessing = aElement.attr(this.config.attributePrefix + "processor-child-processing");
					if (childprocessing != undefined && childprocessing != "")
						ignoreChilds = !de.titus.core.SpecialFunctions.doEvalWithContext(childprocessing, aDataContext, true);
					else
						ignoreChilds = false;
				}
				if (ignoreChilds != true && ignoreChilds != "true")
					this.internalComputeChilds(aElement, dataContext);
			}
			
			if (aElement.tagName() == "jstl" && aElement.contents().length > 0)
				aElement.replaceWith(aElement.contents());
			
			if (processResult) {
				if (theEvents.onSuccess != undefined && typeof theEvents.onSuccess === "function")
					theEvents.onSuccess(aElement, aDataContext, this);
				aElement.trigger(de.titus.jstl.Constants.EVENTS.onSuccess, aDataContext);
			} else if (theEvents.onFail != undefined && typeof theEvents.onFail === "function") {
				theEvents.onFail(aElement, aDataContext, this);
				aElement.trigger(de.titus.jstl.Constants.EVENTS.onFail, aDataContext);
			}
			
			if (isRoot) {
				var processor = this;
				$(document).ready(function() {
					processor.onReady();
				});
			}
			
			return processResult;
		};
		
		de.titus.jstl.Processor.prototype.isElementProcessable = function(aElement) {
			var tagname = aElement.tagName();
			if (tagname != undefined) {
				if (tagname == "br")
					return false;
				
				return true;
			}
			return false;
		};
		
		de.titus.jstl.Processor.prototype.internalExecuteFunction = /* boolean */function(aElement, aDataContext) {
			if (de.titus.jstl.Processor.LOGGER.isDebugEnabled())
				de.titus.jstl.Processor.LOGGER.logDebug("execute internalExecuteFunction(" + aElement + ", " + aDataContext + ")");
			
			var functions = de.titus.jstl.FunctionRegistry.getInstance().functions;
			var result = new de.titus.jstl.FunctionResult();
			for (var i = 0; i < functions.length; i++) {
				var functionObject = functions[i];
				var executeFunction = this.isFunctionNeeded(functionObject, aElement);
				if (executeFunction) {
					var newResult = this.executeFunction(functionObject, aElement, aDataContext, result) || new de.titus.jstl.FunctionResult();
					result.runNextFunction = newResult.runNextFunction && result.runNextFunction;
					result.processChilds = newResult.processChilds && result.processChilds;
					if (!result.runNextFunction)
						return result;
				}
			}
			return result;
		};
		
		de.titus.jstl.Processor.prototype.internalComputeChilds = /* boolean */function(aElement, aDataContext) {
			if (de.titus.jstl.Processor.LOGGER.isDebugEnabled())
				de.titus.jstl.Processor.LOGGER.logDebug("execute internalComputeChilds(" + aElement + ", " + aDataContext + ")");
			
			var childs = aElement.children();
			if (childs == undefined)
				return true;
			
			var processor = this;
			var result = true;
			childs.each(function() {
				if (result && !processor.compute($(this), aDataContext))
					result = false;
			});
			
			return result;
			
		};
		
		de.titus.jstl.Processor.prototype.getEvents = function(aElement) {
			var events = {};
			
			var onLoad = aElement.attr(this.config.attributePrefix + "load");
			var onSuccess = aElement.attr(this.config.attributePrefix + "success");
			var onFail = aElement.attr(this.config.attributePrefix + "fail");
			
			if (onLoad != null)
				events.onLoad = this.expressionResolver.resolveExpression(onLoad, {});
			if (onSuccess != null)
				events.onSuccess = this.expressionResolver.resolveExpression(onSuccess, {});
			if (onFail != null)
				events.onFail = this.expressionResolver.resolveExpression(onFail, {});
			
			return events;
		};
		
		de.titus.jstl.Processor.prototype.isFunctionNeeded = function(aFunction, aElement) {
			if (de.titus.jstl.Processor.LOGGER.isDebugEnabled())
				de.titus.jstl.Processor.LOGGER.logDebug("execute isFunctionNeeded(" + aFunction + ", " + aElement + ")");
			
			var executeFunction = true;
			if (aFunction.attributeName != undefined && aFunction.attributeName != "") {
				var expression = aElement.attr(this.config.attributePrefix + aFunction.attributeName);
				executeFunction = expression !== undefined;
			}
			
			return executeFunction;
		};
		
		de.titus.jstl.Processor.prototype.executeFunction = function(aFunction, aElement, aDataContext, aCurrentFunctionResult) {
			if (de.titus.jstl.Processor.LOGGER.isDebugEnabled())
				de.titus.jstl.Processor.LOGGER.logDebug("execute executeFunction(" + aFunction + ", " + aElement + ", " + aDataContext + ", " + aCurrentFunctionResult + ")");
			
			var result = aFunction.run(aElement, aDataContext, this);
			if (result != undefined) {
				aCurrentFunctionResult.runNextFunction = aCurrentFunctionResult.runNextFunction && result.runNextFunction;
				aCurrentFunctionResult.processChilds = aCurrentFunctionResult.processChilds && result.processChilds;
			}
			
			return aCurrentFunctionResult;
		};
		
		de.titus.jstl.Processor.prototype.onReady = function(aFunction) {
			if (aFunction) {
				// this.onReadyEvent.push(aFunction);
				this.config.element.on(de.titus.jstl.Constants.EVENTS.onReady, function(anEvent) {
					aFunction(anEvent.delegateTarget, anEvent.data);
				});
				return this;
			} else {
				for (var i = 0; i < this.onReadyEvent.length; i++) {
					try {
						this.onReadyEvent[i](this.config.element, this);
					} catch (e) {
						de.titus.jstl.Processor.LOGGER.logError("Error by process an on ready event! -> " + (e.message || e));
					}
				}
				
				this.config.element.trigger(de.titus.jstl.Constants.EVENTS.onReady, this);
			}
		};
	});
})(jQuery);
de.titus.core.Namespace.create("de.titus.jstl.Setup", function() {
	de.titus.jstl.Setup = function() {
	};
	
	
	
	de.titus.jstl.FunctionRegistry.getInstance().add(new de.titus.jstl.functions.If());
	de.titus.jstl.FunctionRegistry.getInstance().add(new de.titus.jstl.functions.Data());
	de.titus.jstl.FunctionRegistry.getInstance().add(new de.titus.jstl.functions.Include());
	de.titus.jstl.FunctionRegistry.getInstance().add(new de.titus.jstl.functions.Choose());
	de.titus.jstl.FunctionRegistry.getInstance().add(new de.titus.jstl.functions.Foreach());
	de.titus.jstl.FunctionRegistry.getInstance().add(new de.titus.jstl.functions.AddAttribute());
	de.titus.jstl.FunctionRegistry.getInstance().add(new de.titus.jstl.functions.TextContent());
	de.titus.jstl.FunctionRegistry.getInstance().add(new de.titus.jstl.functions.AttributeContent());
	
});
