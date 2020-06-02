<script>
  window.onload = function(){
    var lnk = window.location.search.substring(1);
  	var lnkstr = lnk.split('&');
  	for(var i = 0; i <= lnkstr.length; i++){
  			var result = lnkstr[i].split("=");
      		var uri = window.location.toString();
       		if(result[i]=='q'){
              if(result[1].length!==0){
              	document.getElementById("searchBtn").click();
                document.getElementsByClassName("containerModal")[0].style.position="absolute"
             	console.log(result[1]);
              	}
            if(uri.indexOf("q") > 0) {
    			var clean_uri = uri.substring(0, uri.indexOf("?"));
    			window.history.replaceState({}, document.title, clean_uri);
       			}
            }
    }
  }
</script>