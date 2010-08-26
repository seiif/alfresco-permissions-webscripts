/**
 * List all of the permissions for a given node including those inherited from a parent node
 * 
 * @method GET
 *
 * URL: /alfresco/service/permissions/{store_type}/{store_id}/{id}
 *
 * store_type: The type of store you want to query, ex: workspace
 *
 * store_id: The ID of the store you want to query, ex: SpacesStore
 *
 * id: The UUID of the node, ex: aed218e8-df44-4865-84cd-0105252f4993
 *
 * The above values joined together form the nodeRef
 *
 * If the node is not found a 404 error will be returned.  Any missing URI parameters will result in a
 * 400 error.
 * 
 * @returns JSON object: <code>
 * { "permissions": [
          "ALLOWED;test4;Coordinator",
          "ALLOWED;test1;Coordinator"
      	] ,
    	"inherit": false
    }
 * </code>
 *
 * The return object lists the permissions for a specific node:  The permissions follow the format:
 *
 * [ALLOWED|DENIED];[USERNAME|GROUPNAME];PERMISSION
 *
 * Permissions are defined in org.alfresco.service.cmr.security.PermissionService or through custom
 * extension to the permission model.
 *
 * It will also return a boolean value indicating if some permissions are inherited from a parent node.
 *
 * The above example shows two permissions assigned to the node:  the Coordinate permission is
 * given to user1 and user2 on this node.  Permissions are not inherited from the parent node.
 * 
 * author: Jared Ottley (jared.ottley@alfresco.com)
 * version: 1.0
 *
 */
 
var nodeRef = new Array();
nodeRef[0] = url.templateArgs.store_type;
nodeRef[1] = url.templateArgs.store_id;
nodeRef[2] = url.templateArgs.id;

var error = false;


//Check the URI parameters that were supposed to be passed
if (nodeRef[0] == undefined || nodeRef[0].length == 0) {
	error = true;
	status.code = 400;
	status.message = "Store type is missing from URI.";
	status.redirect = true;
}

if (nodeRef[1] == undefined || nodeRef[1].length == 0) {
	error = true;
	status.code = 400;
	status.message = "Store id is missing from URI.";
	status.redirect = true;
}

if (nodeRef[2] == undefined || nodeRef[2].length == 0) {
	error = true;
	status.code = 400;
	status.message = "ID is missing from URI.";
	status.redirect = true;
}

if (!error) {
	//Get the node to work on
	node = search.findNode("node", nodeRef);
	
	//If the node doesn't exist we need to report and exit
	if (node == undefined) {
		status.code = 404;
		status.message = "Node not found: "+nodeRef[0]+"://"+nodeRef[1]+"/"+nodeRef[2];
		status.redirect = true;
	} else {
		//Our Objects to return
		model.permissions = node.getPermissions();
		model.inherit = node.inheritsPermissions();
	}
}
