{
	"permission": [
		<#list permissions as permission>"${permission}"<#if permission_has_next>, </#if></#list>
	] ,
	"inherit": ${inherit?string}
}
