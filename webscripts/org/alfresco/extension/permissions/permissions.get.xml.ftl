<?xml version="1.0" encoding="UTF-8"?>
<node>
	<nodeRef>${node.nodeRef}</nodeRef>
        <permissions>
	<#list permissions as permission>
		<permission>${permission}</permission>
	</#list>
	</permissions>
</node>
