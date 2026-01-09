from rest_framework.response import Response

def api_response(message="", data=None, success=True, status=200, errors=None):
    """
    Standard API response for success or failure
    """
    response = {
        "success": success,  
        "message": message, 
        "data": data if data else {},  
    }

    if errors:
        response["errors"] = errors  

    return Response(response, status=status)
