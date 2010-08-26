/**
 * Update the permissions for a given node
 * 
 * @method POST
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
 * If the node is not found a 404 error will be returned. Missing URI parameters
 * will result in a 400 error.
 * 
 * A JSON object contains the permissions that are being changed: <code>
 *  { permissions: [ 
 *  	"REMOVE;user3;All", 
 *  	"REMOVE;user2;All",
 * 		"ADD;user4;Coordinator",
 * 		"ADD;GROUP_usergroup1;Consumer" ] , 
 * 	"inherit": false 
 * 	}</code>
 * 
 * [ADD|REMOVE];[USERNAME|GROUPNAME];PERMISSION
 * 
 * ADD | REMOVE: Do you want to add or remove the permission for this
 * user/group. Any other value passed will result in a 400 error.
 * 
 * USERNAME | GROUPNAME: The user or group you want the permission to be applied
 * to or removed for. Group names must be prefixed by GROUP_. Unknown User or
 * Groups will result in a 400 error.
 * 
 * PERMISSION: The supported permissions options are defined in
 * org.alfresco.service.cmr.security.PermissionService or through custom
 * extension to the permission model. Unknown permissions will result in a 400
 * error.
 * 
 * It can also contain an optional inherit permission for specifying if the
 * permissions to this node should be inherited from a parent node. Without the
 * inherit option, the current value for that node is maintained. Inherited
 * permissions can not be removed from a node that inherits the permission.
 * 
 * @returns JSON object: <code>
 * { "permissions": [
          "ALLOWED;user1;Coordinator",
          "ALLOWED;user2;Coordinator"
      	] ,
    	"inherit": false
    }
 * </code>
 * 
 * The return object lists the permissions for a specific node: The permissions
 * follow the format:
 * 
 * [ALLOWED|DENIED];[USERNAME|GROUPNAME];PERMISSION
 * 
 * Permissions are defined in
 * org.alfresco.service.cmr.security.PermissionService or through custom
 * extension to the permission model.
 * 
 * It will also return a boolean value indicating if some permissions are
 * inherited from a parent node.
 * 
 * The above example shows two permissions assigned to the node: the Coordinator
 * permission is given to user1 and user2 on this node. Permissions are not
 * inherited from the parent node.
 * 
 * The web script is transactional. Any returned errors will return the node to
 * the state before the call was made
 * 
 * @author: Jared Ottley (jared.ottley@alfresco.com)
 * @version: 1.3
 * 
 */
 
var node;
var permissions;
var nodeRef = new Array();

var error = false;

// Main

// Make sure the permission object was passed in the json and get it
if (json.isNull("permissions")) {
	error = true;
	status.code = 400;
	status.message = "permissions not found in json object";
	status.redirect = true;
} else {
	permissions = json.getJSONArray("permissions");
}

// What node do we want to work on
if (!error) {
	nodeRef[0] = url.templateArgs.store_type;
	nodeRef[1] = url.templateArgs.store_id;
	nodeRef[2] = url.templateArgs.id;

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
		node = search.findNode("node", nodeRef);
	}
}
	
// Make sure it exists
if (node == undefined) {
	status.code = 404;
	status.message = "Node not found: "+nodeRef[0]+"://"+nodeRef[1]+"/"+nodeRef[2];
	status.redirect = true;
} else {
		
	// How many permission strings do we need to work with
	if (permissions.length() > 0){
		
		try {
			for (i = 0; i < permissions.length(); i++) {
				// Working set
				var work = new Array();
			
				// Take the permission string and split it into its individual 
				//parts
				work = String(permissions.get(i)).split(";");
				
				// Make sure the User and Group exist; SPECIAL CASE: the
				// everyone group is never returned by getGroup so we need to 
				// make an exception
				if (((people.getPerson(work[1]) != undefined || people.getGroup(work[1]) != undefined)) || work[1] == "GROUP_EVERYONE") {
					
					// Look up the action, add or remove that permission
					switch (work[0]) {
						case "ADD": case "add": case "Add":
							node.setPermission(work[2], work[1]);
							break;
						case "REMOVE": case "remove": case "Remove":
							node.removePermission(work[2], work[1]);
							break;
						default:
							// if the action is unknown we need to get out of here
							throw { code:400, message: "Unsupported action: "+work[0]+". Only ADD or REMOVE are supported"};
							break;			
					}
					
				} else {
					// if the user or the group do not exist we need to get out 
					// of here
					throw { code:400, message: "There is no Authority (user or group) with the name "+work[1] };
				}
			}
			
			// Was the inherit object passed? If so, let's turn on or off the
			// inheritance of permissions
			if (!json.isNull("inherit")){
				node.setInheritsPermissions(eval('('+json.get("inherit")+')'));
			}
				
				// Our objects to return
				model.permissions = node.getPermissions();
				model.inherit = node.inheritsPermissions();
		
		} catch (e if e.javaException instanceof java.lang.UnsupportedOperationException) {
			// This case will catch permissions that are unknown. Rollback is
			// handled by the framework
			status.code = 400;
			status.message = e.message+". "+work[2]+" is not a known permission.";
			status.redirect = true;
		} 
	
	} else {
		status.code = 400;
		status.message = "Permissions not found.";
		status.redirect = true;
	}
}