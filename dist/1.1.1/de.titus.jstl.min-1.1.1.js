de.titus.core.Namespace.create("de.titus.jstl.ExpressionResolver",function(){de.titus.jstl.ExpressionResolver=function(aDomHelper){this.domHelper=aDomHelper||de.titus.core.DomHelper.getInstance();};de.titus.jstl.ExpressionResolver.LOGGER=de.titus.logging.LoggerFactory.getInstance().newLogger("de.titus.jstl.ExpressionResolver");de.titus.jstl.ExpressionResolver.prototype.TEXT_EXPRESSION_REGEX=new de.titus.core.regex.Regex("\\$\\{([^\\$\\{\\}]*)\\}");de.titus.jstl.ExpressionResolver.prototype.resolveText=function(aText,aDataContext,aDefaultValue){if(de.titus.jstl.ExpressionResolver.LOGGER.isDebugEnabled()){de.titus.jstl.ExpressionResolver.LOGGER.logDebug("execute resolveText("+aText+", "+aDataContext+", "+aDefaultValue+")");}var text=aText;var matcher=this.TEXT_EXPRESSION_REGEX.parse(text);while(matcher.next()){var expression=matcher.getMatch();var expressionResult=this.internalResolveExpression(matcher.getGroup(1),aDataContext,aDefaultValue);if(expressionResult!=undefined){text=matcher.replaceAll(expressionResult,text);
}}return text;};de.titus.jstl.ExpressionResolver.prototype.resolveExpression=function(aExpression,aDataContext,aDefaultValue){if(de.titus.jstl.ExpressionResolver.LOGGER.isDebugEnabled()){de.titus.jstl.ExpressionResolver.LOGGER.logDebug("execute resolveText("+aExpression+", "+aDataContext+", "+aDefaultValue+")");}var matcher=this.TEXT_EXPRESSION_REGEX.parse(aExpression);if(matcher.next()){return this.internalResolveExpression(matcher.getGroup(1),aDataContext,aDefaultValue);}return this.internalResolveExpression(aExpression,aDataContext,aDefaultValue);};de.titus.jstl.ExpressionResolver.prototype.internalResolveExpression=function(aExpression,aDataContext,aDefaultValue){try{var result=this.domHelper.doEvalWithContext(aExpression,aDataContext,aDefaultValue);if(result==undefined){return aDefaultValue;}return result;}catch(e){return undefined;}};});de.titus.core.Namespace.create("de.titus.jstl.FunctionRegistry",function(){de.titus.jstl.FunctionRegistry=function(){this.functions=new Array();};
de.titus.jstl.FunctionRegistry.prototype.add=function(aFunction){this.functions.push(aFunction);};de.titus.jstl.FunctionRegistry.getInstance=function(){if(de.titus.jstl.FunctionRegistry.INSTANCE==undefined){de.titus.jstl.FunctionRegistry.INSTANCE=new de.titus.jstl.FunctionRegistry();}return de.titus.jstl.FunctionRegistry.INSTANCE;};});de.titus.core.Namespace.create("de.titus.jstl.FunctionResult",function(){de.titus.jstl.FunctionResult=function(runNextFunction,processChilds){this.runNextFunction=runNextFunction||true;this.processChilds=processChilds||true;};});de.titus.core.Namespace.create("de.titus.jstl.IFunction",function(){de.titus.jstl.IFunction=function(theAttributeName){this.attributeName=theAttributeName;};de.titus.jstl.IFunction.prototype.run=function(aElement,aDataContext,aProcessor){return true;};});de.titus.core.Namespace.create("de.titus.jstl.functions.If",function(){de.titus.jstl.functions.If=function(){};de.titus.jstl.functions.If.prototype=new de.titus.jstl.IFunction("if");
de.titus.jstl.functions.If.prototype.constructor=de.titus.jstl.functions.If;de.titus.jstl.functions.If.LOGGER=de.titus.logging.LoggerFactory.getInstance().newLogger("de.titus.jstl.functions.If");de.titus.jstl.functions.If.prototype.run=function(aElement,aDataContext,aProcessor){if(de.titus.jstl.functions.If.LOGGER.isDebugEnabled()){de.titus.jstl.functions.If.LOGGER.logDebug("execute run("+aElement+", "+aDataContext+", "+aProcessor+")");}var processor=aProcessor||new de.titus.jstl.Processor();var expressionResolver=processor.expressionResolver||new de.titus.jstl.ExpressionResolver();var domHelper=processor.domHelper||de.titus.core.DomHelper.getInstance();var expression=domHelper.getAttribute(aElement,processor.config.attributePrefix+this.attributeName);if(expression!=undefined&&expression.lenght!=0){var expressionResult=expressionResolver.resolveExpression(expression,aDataContext,false);if(domHelper.isFunction(expressionResult)){expressionResult=expressionResult(aElement,aDataContext,aProcessor);
}expressionResult=expressionResult==true;if(!expressionResult){domHelper.doRemove(aElement);return new de.titus.jstl.FunctionResult(false,false);}}return new de.titus.jstl.FunctionResult(true,true);};});de.titus.core.Namespace.create("de.titus.jstl.functions.Choose",function(){de.titus.jstl.functions.Choose=function(){};de.titus.jstl.functions.Choose.prototype=new de.titus.jstl.IFunction("choose");de.titus.jstl.functions.Choose.prototype.constructor=de.titus.jstl.functions.Choose;de.titus.jstl.functions.Choose.LOGGER=de.titus.logging.LoggerFactory.getInstance().newLogger("de.titus.jstl.functions.Choose");de.titus.jstl.functions.Choose.prototype.run=function(aElement,aDataContext,aProcessor){if(de.titus.jstl.functions.Choose.LOGGER.isDebugEnabled()){de.titus.jstl.functions.Choose.LOGGER.logDebug("execute run("+aElement+", "+aDataContext+", "+aProcessor+")");}var processor=aProcessor||new de.titus.jstl.Processor();var expressionResolver=processor.expressionResolver||new de.titus.jstl.ExpressionResolver();
var domHelper=processor.domHelper||de.titus.core.DomHelper.getInstance();var expression=domHelper.getAttribute(aElement,processor.config.attributePrefix+this.attributeName);if(expression!=undefined){this.processChilds(aElement,aDataContext,processor,expressionResolver,domHelper);return new de.titus.jstl.FunctionResult(true,true);}return new de.titus.jstl.FunctionResult(true,true);};de.titus.jstl.functions.Choose.prototype.processChilds=function(aChooseElement,aDataContext,aProcessor,aExpressionResolver,aDomHelper){if(de.titus.jstl.functions.Choose.LOGGER.isDebugEnabled()){de.titus.jstl.functions.Choose.LOGGER.logDebug("execute processChilds("+aChooseElement+", "+aDataContext+", "+aProcessor+", "+aExpressionResolver+", "+aDomHelper+")");}var childs=aDomHelper.getChilds(aChooseElement);var resolved=false;for(var i=0;i<childs.length;i++){var child=aDomHelper.toDomObject(childs[i]);if(!resolved&&this.processChild(aChooseElement,child,aDataContext,aProcessor,aExpressionResolver,aDomHelper)){if(de.titus.jstl.functions.Choose.LOGGER.isTraceEnabled()){de.titus.jstl.functions.Choose.LOGGER.logTrace("compute child: "+child);
}resolved=true;}else{if(de.titus.jstl.functions.Choose.LOGGER.isTraceEnabled()){de.titus.jstl.functions.Choose.LOGGER.logTrace("remove child: "+child);}aDomHelper.doRemove(child);}}};de.titus.jstl.functions.Choose.prototype.processChild=function(aChooseElement,aElement,aDataContext,aProcessor,aExpressionResolver,aDomHelper){if(de.titus.jstl.functions.Choose.LOGGER.isDebugEnabled()){de.titus.jstl.functions.Choose.LOGGER.logDebug("execute processChild("+aChooseElement+", "+aElement+", "+aDataContext+", "+aProcessor+", "+aExpressionResolver+", "+aDomHelper+")");}if(this.processWhenElement(aChooseElement,aElement,aDataContext,aProcessor,aExpressionResolver,aDomHelper)){return true;}else{if(this.processOtherwiseElement(aChooseElement,aElement,aDataContext,aProcessor,aExpressionResolver,aDomHelper)){return true;}else{return false;}}};de.titus.jstl.functions.Choose.prototype.processWhenElement=function(aChooseElement,aElement,aDataContext,aProcessor,aExpressionResolver,aDomHelper){if(de.titus.jstl.functions.Choose.LOGGER.isDebugEnabled()){de.titus.jstl.functions.Choose.LOGGER.logDebug("execute processWhenElement("+aChooseElement+", "+aElement+", "+aDataContext+", "+aProcessor+", "+aExpressionResolver+", "+aDomHelper+")");
}var expression=aDomHelper.getAttribute(aElement,aProcessor.config.attributePrefix+"when");if(expression!=undefined){return aExpressionResolver.resolveExpression(expression,aDataContext,false);}return false;};de.titus.jstl.functions.Choose.prototype.processOtherwiseElement=function(aChooseElement,aElement,aDataContext,aProcessor,aExpressionResolver,aDomHelper){if(de.titus.jstl.functions.Choose.LOGGER.isDebugEnabled()){de.titus.jstl.functions.Choose.LOGGER.logDebug("execute processOtherwiseElement("+aChooseElement+", "+aElement+", "+aDataContext+", "+aProcessor+", "+aExpressionResolver+", "+aDomHelper+")");}var expression=aDomHelper.getAttribute(aElement,aProcessor.config.attributePrefix+"otherwise");if(expression!=undefined){return true;}return false;};});de.titus.core.Namespace.create("de.titus.jstl.functions.Foreach",function(){de.titus.jstl.functions.Foreach=function(){};de.titus.jstl.functions.Foreach.prototype=new de.titus.jstl.IFunction("foreach");de.titus.jstl.functions.Foreach.prototype.constructor=de.titus.jstl.functions.Foreach;
de.titus.jstl.functions.Foreach.LOGGER=de.titus.logging.LoggerFactory.getInstance().newLogger("de.titus.jstl.functions.Foreach");de.titus.jstl.functions.Foreach.prototype.run=function(aElement,aDataContext,aProcessor){if(de.titus.jstl.functions.Foreach.LOGGER.isDebugEnabled()){de.titus.jstl.functions.Foreach.LOGGER.logDebug("execute run("+aElement+", "+aDataContext+", "+aProcessor+")");}var processor=aProcessor||new de.titus.jstl.Processor();var expressionResolver=processor.expressionResolver||new de.titus.jstl.ExpressionResolver();var domHelper=processor.domHelper||de.titus.core.DomHelper.getInstance();var expression=domHelper.getAttribute(aElement,processor.config.attributePrefix+this.attributeName);if(expression!=undefined){this.internalProcession(expression,aElement,aDataContext,processor,expressionResolver,domHelper);return new de.titus.jstl.FunctionResult(true,true);}return new de.titus.jstl.FunctionResult(true,true);};de.titus.jstl.functions.Foreach.prototype.internalProcession=function(aExpression,aElement,aDataContext,aProcessor,anExpressionResolver,aDomHelper){if(de.titus.jstl.functions.Foreach.LOGGER.isDebugEnabled()){de.titus.jstl.functions.Foreach.LOGGER.logDebug("execute processList("+aElement+", "+aDataContext+", "+aProcessor+", "+anExpressionResolver+", "+aDomHelper+")");
}var tempalte=this.getRepeatableContent(aElement,aDomHelper);aDomHelper.doRemoveChilds(aElement);if(tempalte==undefined){return;}var varName=this.getVarname(aElement,aProcessor,aDomHelper);var statusName=this.getStatusName(aElement,aProcessor,aDomHelper);var list=undefined;if(aExpression==""){de.titus.jstl.functions.Foreach.LOGGER.logWarn("No list data specified. Using the data context!");list=aDataContext;}else{list=anExpressionResolver.resolveExpression(aExpression,aDataContext,new Array());}if(list!=undefined&&aDomHelper.isArray(list)&&list.length>0){this.processList(list,tempalte,varName,statusName,aElement,aDataContext,aProcessor,anExpressionResolver,aDomHelper);}else{if(list!=undefined){this.processMap(list,tempalte,varName,statusName,aElement,aDataContext,aProcessor,anExpressionResolver,aDomHelper);}}};de.titus.jstl.functions.Foreach.prototype.processList=function(aListData,aTemplate,aVarname,aStatusName,aElement,aDataContext,aProcessor,anExpressionResolver,aDomHelper){for(var i=0;
i<aListData.length;i++){var newContent=aDomHelper.cloneDomObject(aTemplate);var newContext={};newContext[aVarname]=aListData[i];newContext[aStatusName]={"index":i,"number":(i+1),"count":aListData.length,"data":aListData,"context":aDataContext};this.processNewContent(newContent,newContext,aElement,aProcessor,aDomHelper);}};de.titus.jstl.functions.Foreach.prototype.processMap=function(aMap,aTemplate,aVarname,aStatusName,aElement,aDataContext,aProcessor,anExpressionResolver,aDomHelper){var count=0;for(var name in aMap){count++;}var i=0;for(var name in aMap){var newContent=aDomHelper.cloneDomObject(aTemplate);var newContext={};newContext[aVarname]=aMap[name];newContext[aStatusName]={"index":i,"number":(i+1),"count":count,"data":aMap,"context":aDataContext};i++;this.processNewContent(newContent,newContext,aElement,aProcessor,aDomHelper);}};de.titus.jstl.functions.Foreach.prototype.processNewContent=function(aNewContent,aNewContext,aElement,aProcessor,aDomHelper){var tempContent=aDomHelper.toDomObject("<div></div>");
aDomHelper.setHtml(tempContent,aNewContent,"append");aProcessor.compute(tempContent,aNewContext);var childs=aDomHelper.getChilds(tempContent);aDomHelper.setHtml(aElement,childs,"append");};de.titus.jstl.functions.Foreach.prototype.getVarname=function(aElement,aProcessor,aDomHelper){var varname=aDomHelper.getAttribute(aElement,aProcessor.config.attributePrefix+this.attributeName+"-var");if(varname==undefined){return"itemVar";}return varname;};de.titus.jstl.functions.Foreach.prototype.getStatusName=function(aElement,aProcessor,aDomHelper){var statusName=aDomHelper.getAttribute(aElement,aProcessor.config.attributePrefix+this.attributeName+"-status");if(statusName==undefined){return"statusVar";}return statusName;};de.titus.jstl.functions.Foreach.prototype.getRepeatableContent=function(aElement,aDomHelper){var childs=aDomHelper.getChilds(aElement);return aDomHelper.toDomObject(childs);};});de.titus.core.Namespace.create("de.titus.jstl.functions.TextContent",function(){de.titus.jstl.functions.TextContent=function(){};
de.titus.jstl.functions.TextContent.prototype=new de.titus.jstl.IFunction();de.titus.jstl.functions.TextContent.prototype.constructor=de.titus.jstl.functions.TextContent;de.titus.jstl.functions.TextContent.LOGGER=de.titus.logging.LoggerFactory.getInstance().newLogger("de.titus.jstl.functions.TextContent");de.titus.jstl.functions.TextContent.prototype.run=function(aElement,aDataContext,aProcessor){if(de.titus.jstl.functions.TextContent.LOGGER.isDebugEnabled()){de.titus.jstl.functions.TextContent.LOGGER.logDebug("execute run("+aElement+", "+aDataContext+", "+aProcessor+")");}var processor=aProcessor||new de.titus.jstl.Processor();var expressionResolver=processor.expressionResolver||new de.titus.jstl.ExpressionResolver();var domHelper=processor.domHelper||de.titus.core.DomHelper.getInstance();var childCount=domHelper.getChildCount(aElement);if(childCount==0){var text=domHelper.getText(aElement);text=expressionResolver.resolveText(text,aDataContext);domHelper.setText(aElement,text,"replace");
}return new de.titus.jstl.FunctionResult(true,true);};});de.titus.core.Namespace.create("de.titus.jstl.functions.AttributeContent",function(){de.titus.jstl.functions.AttributeContent=function(){};de.titus.jstl.functions.AttributeContent.prototype=new de.titus.jstl.IFunction();de.titus.jstl.functions.AttributeContent.prototype.constructor=de.titus.jstl.functions.AttributeContent;de.titus.jstl.functions.AttributeContent.LOGGER=de.titus.logging.LoggerFactory.getInstance().newLogger("de.titus.jstl.functions.AttributeContent");de.titus.jstl.functions.AttributeContent.prototype.run=function(aElement,aDataContext,aProcessor){if(de.titus.jstl.functions.AttributeContent.LOGGER.isDebugEnabled()){de.titus.jstl.functions.AttributeContent.LOGGER.logDebug("execute run("+aElement+", "+aDataContext+", "+aProcessor+")");}var processor=aProcessor||new de.titus.jstl.Processor();var expressionResolver=processor.expressionResolver||new de.titus.jstl.ExpressionResolver();var domHelper=processor.domHelper||de.titus.core.DomHelper.getInstance();
var attributes=domHelper.getAttributes(aElement);for(var name in attributes){if(name.indexOf(processor.config.attributePrefix)!=0){var value=attributes[name];if(value!=undefined&&value!=null&&value!=""&&value!="null"){try{var newValue=expressionResolver.resolveText(value,aDataContext);if(value!=newValue){if(de.titus.jstl.functions.AttributeContent.LOGGER.isDebugEnabled()){de.titus.jstl.functions.AttributeContent.LOGGER.logDebug('Change attribute "'+name+'" from "'+value+'" to "'+newValue+'"!');}domHelper.setAttribute(aElement,name,newValue);}}catch(e){de.titus.jstl.functions.AttributeContent.LOGGER.logError("Can't process attribute\""+name+'" with value "'+value+'"!');}}}}return new de.titus.jstl.FunctionResult(true,true);};});de.titus.core.Namespace.create("de.titus.jstl.functions.Data",function(){de.titus.jstl.functions.Data=function(){};de.titus.jstl.functions.Data.prototype=new de.titus.jstl.IFunction("data");de.titus.jstl.functions.Data.prototype.constructor=de.titus.jstl.functions.Data;
de.titus.jstl.functions.Data.LOGGER=de.titus.logging.LoggerFactory.getInstance().newLogger("de.titus.jstl.functions.Data");de.titus.jstl.functions.Data.prototype.run=function(aElement,aDataContext,aProcessor){if(de.titus.jstl.functions.Data.LOGGER.isDebugEnabled()){de.titus.jstl.functions.Data.LOGGER.logDebug("execute run("+aElement+", "+aDataContext+", "+aProcessor+")");}var processor=aProcessor||new de.titus.jstl.Processor();var expressionResolver=processor.expressionResolver||new de.titus.jstl.ExpressionResolver();var domHelper=processor.domHelper||de.titus.core.DomHelper.getInstance();var expression=domHelper.getAttribute(aElement,processor.config.attributePrefix+this.attributeName);if(expression!=undefined&&expression.length!=0&&expression!=""){this.internalProcessing(expression,aElement,aDataContext,processor,expressionResolver,domHelper);}return new de.titus.jstl.FunctionResult(true,true);};de.titus.jstl.functions.Data.prototype.internalProcessing=function(anExpression,aElement,aDataContext,aProcessor,anExpressionResolver,aDomHelper){var varname=this.getVarname(aElement,aDataContext,aProcessor,anExpressionResolver,aDomHelper);
var mode=this.getMode(aElement,aProcessor,anExpressionResolver,aDomHelper);if(mode=="remote"){this.doRemote(anExpression,aElement,varname,aDataContext,aProcessor,anExpressionResolver,aDomHelper);}else{this.doDirect(anExpression,aElement,varname,aDataContext,aProcessor,anExpressionResolver,aDomHelper);}};de.titus.jstl.functions.Data.prototype.getOptions=function(aElement,aDataContext,aProcessor,anExpressionResolver,aDomHelper){var options=aDomHelper.getAttribute(aElement,aProcessor.config.attributePrefix+this.attributeName+"-options");if(options!=undefined){options=anExpressionResolver.resolveText(options,aDataContext);options=anExpressionResolver.resolveExpression(options,aDataContext);return options||{};}return{};};de.titus.jstl.functions.Data.prototype.getMode=function(aElement,aProcessor,anExpressionResolver,aDomHelper){var mode=aDomHelper.getAttribute(aElement,aProcessor.config.attributePrefix+this.attributeName+"-mode");if(mode==undefined){return"direct";}mode=mode.toLowerCase();if(mode=="direct"||mode=="remote"){return mode;
}return"direct";};de.titus.jstl.functions.Data.prototype.getVarname=function(aElement,aDataContext,aProcessor,anExpressionResolver,aDomHelper){var varname=aDomHelper.getAttribute(aElement,aProcessor.config.attributePrefix+this.attributeName+"-var");return varname;};de.titus.jstl.functions.Data.prototype.doDirect=function(anExpression,aElement,aVarname,aDataContext,aProcessor,anExpressionResolver,aDomHelper){var newData=anExpressionResolver.resolveExpression(anExpression,aDataContext);this.addNewData(newData,aVarname,aDataContext,aProcessor,anExpressionResolver,aDomHelper);};de.titus.jstl.functions.Data.prototype.doRemote=function(anExpression,aElement,aVarname,aDataContext,aProcessor,anExpressionResolver,aDomHelper){var varname=aVarname;var dataContext=aDataContext;var processor=aProcessor;var expressionResolver=anExpressionResolver;var domHelper=aDomHelper;var this_=this;var url=expressionResolver.resolveText(anExpression,dataContext);var option=this.getOptions(aElement,aDataContext,aProcessor,anExpressionResolver,aDomHelper);
var ajaxSettings={"url":url,"async":false,"cache":false};ajaxSettings=domHelper.mergeObjects(ajaxSettings,option);domHelper.doRemoteLoadJson(ajaxSettings,function(newData){this_.addNewData(newData,varname,dataContext,processor,expressionResolver,domHelper);});};de.titus.jstl.functions.Data.prototype.addNewData=function(aNewData,aVarname,aDataContext,aProcessor,anExpressionResolver,aDomHelper){if(de.titus.jstl.functions.Data.LOGGER.isDebugEnabled()){de.titus.jstl.functions.Data.LOGGER.logDebug("execute addNewData("+aNewData+", "+aVarname+", "+aDataContext+", "+aProcessor+", "+anExpressionResolver+", "+aDomHelper+")");}if(aVarname==undefined){aDomHelper.mergeObjects(aDataContext,aNewData);}else{aDataContext[aVarname]=aNewData;}};});de.titus.core.Namespace.create("de.titus.jstl.functions.Include",function(){de.titus.jstl.functions.Include=function(){};de.titus.jstl.functions.Include.prototype=new de.titus.jstl.IFunction("include");de.titus.jstl.functions.Include.prototype.constructor=de.titus.jstl.functions.Include;
de.titus.jstl.functions.Include.LOGGER=de.titus.logging.LoggerFactory.getInstance().newLogger("de.titus.jstl.functions.Include");de.titus.jstl.functions.Include.prototype.run=function(aElement,aDataContext,aProcessor){if(de.titus.jstl.functions.Include.LOGGER.isDebugEnabled()){de.titus.jstl.functions.Include.LOGGER.logDebug("execute run("+aElement+", "+aDataContext+", "+aProcessor+")");}var processor=aProcessor||new de.titus.jstl.Processor();var expressionResolver=processor.expressionResolver||new de.titus.jstl.ExpressionResolver();var domHelper=processor.domHelper||de.titus.core.DomHelper.getInstance();var expression=domHelper.getAttribute(aElement,processor.config.attributePrefix+this.attributeName);if(expression!=undefined&&expression.length!=0&&expression!=""){this.internalProcessing(expression,aElement,aDataContext,processor,expressionResolver,domHelper);}return new de.titus.jstl.FunctionResult(true,true);};de.titus.jstl.functions.Include.prototype.internalProcessing=function(anIncludeExpression,aElement,aDataContext,aProcessor,anExpressionResolver,aDomHelper){var element=aElement;
var domHelper=aDomHelper;var url=anExpressionResolver.resolveText(anIncludeExpression,aDataContext);var includeMode=this.getIncludeMode(aElement,aDataContext,aProcessor,anExpressionResolver,aDomHelper);var options=this.getOptions(aElement,aDataContext,aProcessor,anExpressionResolver,aDomHelper);var ajaxSettings={"url":url,"async":false,"cache":true};ajaxSettings=domHelper.mergeObjects(ajaxSettings,options);var this_=this;domHelper.doRemoteLoadHtml(ajaxSettings,function(template){this_.addHtml(element,template,includeMode,domHelper);});};de.titus.jstl.functions.Include.prototype.getOptions=function(aElement,aDataContext,aProcessor,anExpressionResolver,aDomHelper){var options=aDomHelper.getAttribute(aElement,aProcessor.config.attributePrefix+this.attributeName+"-options");if(options!=undefined){options=anExpressionResolver.resolveText(options,aDataContext);options=anExpressionResolver.resolveExpression(options,aDataContext);return options||{};}return{};};de.titus.jstl.functions.Include.prototype.getIncludeMode=function(aElement,aDataContext,aProcessor,anExpressionResolver,aDomHelper){var mode=aDomHelper.getAttribute(aElement,aProcessor.config.attributePrefix+this.attributeName+"-mode");
if(mode==undefined){return"append";}mode=mode.toLowerCase();if(mode=="append"||mode=="replace"||mode=="prepend"){return mode;}return"append";};de.titus.jstl.functions.Include.prototype.addHtml=function(aElement,aTemplate,aIncludeMode,aDomHelper){if(de.titus.jstl.functions.Include.LOGGER.isDebugEnabled()){de.titus.jstl.functions.Include.LOGGER.logDebug("execute addHtml("+aElement+", "+aTemplate+", "+aIncludeMode+", "+aDomHelper+")");}aDomHelper.setHtml(aElement,aTemplate,aIncludeMode);};});de.titus.core.Namespace.create("de.titus.jstl.Processor",function(){de.titus.jstl.Processor=function(aConfig){this.domHelper=aConfig.domHelper||de.titus.core.DomHelper.getInstance();this.config={"data":{},"attributePrefix":"jstl-"};this.config=this.domHelper.mergeObjects(this.config,aConfig);this.rootElement=this.domHelper.toDomObject(this.config.element);this.rootDataContext=this.config.data;this.expressionResolver=new de.titus.jstl.ExpressionResolver(this.domHelper);this.onReadyEvent=new Array();};de.titus.jstl.Processor.LOGGER=de.titus.logging.LoggerFactory.getInstance().newLogger("de.titus.jstl.Processor");
de.titus.jstl.Processor.prototype.compute=function(aElement,aDataContext){if(de.titus.jstl.Processor.LOGGER.isDebugEnabled()){de.titus.jstl.Processor.LOGGER.logDebug("execute compute("+(aElement.prop("tagName")||aElement)+", "+aDataContext+")");}if(aElement==undefined){return this.internalComputeRoot();}if(!this.isElementProcessable(aElement)){return true;}var events=this.getEvents(aElement)||{};return this.internalComputeElement(aElement,aDataContext,events,false);};de.titus.jstl.Processor.prototype.internalComputeRoot=function(){var events=this.getEvents(this.rootElement)||{};if(this.config.onLoad){events.onLoad=this.config.onLoad;}if(this.config.onSuccess){events.onSuccess=this.config.onSuccess;}if(this.config.onFail){events.onFail=this.config.onFail;}return this.internalComputeElement(this.rootElement,this.rootDataContext,events,true);};de.titus.jstl.Processor.prototype.internalComputeElement=function(aElement,aDataContext,theEvents,isRoot){var dataContext=aDataContext||this.rootDataContext;
if(theEvents.onLoad!=undefined&&this.domHelper.isFunction(theEvents.onLoad)){theEvents.onLoad(aElement,aDataContext,this);}var processResult=true;try{var result=this.internalExecuteFunction(aElement,dataContext);if(result.processChilds){this.internalComputeChilds(aElement,dataContext);}}catch(e){de.titus.jstl.Processor.LOGGER.logError('error by processing the element "'+(aElement.prop("tagName")||aElement)+'"! ->'+(e.message||e));processResult=false;}if(processResult&&theEvents.onSuccess!=undefined&&this.domHelper.isFunction(theEvents.onSuccess)){theEvents.onSuccess(aElement,aDataContext,this);}else{if(theEvents.onFail!=undefined&&this.domHelper.isFunction(theEvents.onFail)){theEvents.onFail(aElement,aDataContext,this);}}if(isRoot){var processor=this;this.domHelper.doOnReady(function(){processor.onReady();});}return processResult;};de.titus.jstl.Processor.prototype.isElementProcessable=function(aElement){var tagname=this.domHelper.getProperty(aElement,"tagName");if(tagname!=undefined){if(tagname.toLowerCase()=="br"){return false;
}return true;}return false;};de.titus.jstl.Processor.prototype.internalExecuteFunction=function(aElement,aDataContext){if(de.titus.jstl.Processor.LOGGER.isDebugEnabled()){de.titus.jstl.Processor.LOGGER.logDebug("execute internalExecuteFunction("+aElement+", "+aDataContext+")");}var functions=de.titus.jstl.FunctionRegistry.getInstance().functions;var result=new de.titus.jstl.FunctionResult();for(var i=0;i<functions.length;i++){var functionObject=functions[i];var executeFunction=this.isFunctionNeeded(functionObject,aElement);if(executeFunction){var result=this.executeFunction(functionObject,aElement,aDataContext,result);if(!result.runNextFunction){return result;}}}return result;};de.titus.jstl.Processor.prototype.internalComputeChilds=function(aElement,aDataContext){if(de.titus.jstl.Processor.LOGGER.isDebugEnabled()){de.titus.jstl.Processor.LOGGER.logDebug("execute internalComputeChilds("+aElement+", "+aDataContext+")");}var childs=this.domHelper.getChilds(aElement);if(childs==undefined){return true;
}else{if(!this.domHelper.isArray(childs)){return this.compute(childs,aDataContext);}else{for(var i=0;i<childs.length;i++){var newElement=this.domHelper.toDomObject(childs[i]);if(!this.compute(newElement,aDataContext)){return false;}}}}return true;};de.titus.jstl.Processor.prototype.getEvents=function(aElement){var events={};var onLoad=this.domHelper.getAttribute(aElement,this.config.attributePrefix+"load");var onSuccess=this.domHelper.getAttribute(aElement,this.config.attributePrefix+"success");var onFail=this.domHelper.getAttribute(aElement,this.config.attributePrefix+"fail");if(onLoad!=null){events.onLoad=this.expressionResolver.resolveExpression(onLoad,{});}if(onSuccess!=null){events.onSuccess=this.expressionResolver.resolveExpression(onSuccess,{});}if(onFail!=null){events.onFail=this.expressionResolver.resolveExpression(onLoad,{});}return events;};de.titus.jstl.Processor.prototype.isFunctionNeeded=function(aFunction,aElement){if(de.titus.jstl.Processor.LOGGER.isDebugEnabled()){de.titus.jstl.Processor.LOGGER.logDebug("execute isFunctionNeeded("+aFunction+", "+aElement+")");
}var executeFunction=true;if(aFunction.attributeName!=undefined&&aFunction.attributeName!=""){var expression=this.domHelper.getAttribute(aElement,this.config.attributePrefix+aFunction.attributeName);executeFunction=expression!=undefined;}return executeFunction;};de.titus.jstl.Processor.prototype.executeFunction=function(aFunction,aElement,aDataContext,aCurrentFunctionResult){if(de.titus.jstl.Processor.LOGGER.isDebugEnabled()){de.titus.jstl.Processor.LOGGER.logDebug("execute executeFunction("+aFunction+", "+aElement+", "+aDataContext+", "+aCurrentFunctionResult+")");}var result=aFunction.run(aElement,aDataContext,this);if(result!=undefined){aCurrentFunctionResult.runNextFunction=aCurrentFunctionResult.runNextFunction&&result.runNextFunction;aCurrentFunctionResult.processChilds=aCurrentFunctionResult.processChilds&&result.processChilds;}return aCurrentFunctionResult;};de.titus.jstl.Processor.prototype.onReady=function(aFunction){if(aFunction){this.onReadyEvent.push(aFunction);}else{for(var i=0;
i<this.onReadyEvent.length;i++){try{this.onReadyEvent[i](this.rootElement,this);}catch(e){de.titus.jstl.Processor.LOGGER.logError("Error by process an on ready event! -> "+(e.message||e));}}}};});de.titus.core.Namespace.create("de.titus.jstl.Setup",function(){de.titus.jstl.Setup=function(){};de.titus.jstl.FunctionRegistry.getInstance().add(new de.titus.jstl.functions.If());de.titus.jstl.FunctionRegistry.getInstance().add(new de.titus.jstl.functions.Data());de.titus.jstl.FunctionRegistry.getInstance().add(new de.titus.jstl.functions.Include());de.titus.jstl.FunctionRegistry.getInstance().add(new de.titus.jstl.functions.Choose());de.titus.jstl.FunctionRegistry.getInstance().add(new de.titus.jstl.functions.Foreach());de.titus.jstl.FunctionRegistry.getInstance().add(new de.titus.jstl.functions.TextContent());de.titus.jstl.FunctionRegistry.getInstance().add(new de.titus.jstl.functions.AttributeContent());});