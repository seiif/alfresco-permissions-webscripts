These project is the start of a collection of web scripts to help manager permissions in Alfresco.

Currently there are two web scripts:
  * permissions GET -- This web script returns the current permissions for a given node
  * permissions POST -- This web script allows you to modify the permissions for a given node

Both web scripts by default return the permissions is a JSON object, where each permission is defined as a triplet of

[ALLOWED|DENIED];[USERNAME|GROUPNAME];PERMISSION

permissions POST reads the modifications from a JSON object, where the permissions are also defined as a triplet

[ADD|REMOVE];[USERNAME|GROUPNAME];PERMISSION

The expected format of this JSON object is

{ permissions: [
> "REMOVE;user3;All",
> "REMOVE;user2;All",
> "ADD;user4;Coordinator",
> "ADD;GROUP\_usergroup1;Consumer" ] ,
"inherit": false
}

inherit is optional.  It allows you to specify if the permissions of the parent node should be inherited to the node.

There are two separate releases:  The first has been tested on Alfresco Enterprise 3.1.0 - 3.2.0.  The second has been tested on 3.2.1 to 3.3.1.