$( document ).ready(function() {
    $().on("click", "#addAppBtn",function () {
        alert("Button was clicked");
        $("#newAppDiv").hide();
    });
});