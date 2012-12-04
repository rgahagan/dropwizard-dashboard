google.load('visualization', '1', { packages:['corechart', 'gauge'] });
google.setOnLoadCallback(googleChartsLoaded);


// All components should have registered them self by now
Dropwizard.applyBindings();

function googleChartsLoaded() {
    Dropwizard.bindings.googleChartsLoaded(true);
    initializeWebsocketConnection();
}


function initializeWebsocketConnection() {

    var heart = $("#heart");
    var hearts = $(".heart");

    if (window.WebSocket) {
        Dropwizard.bindings.beforeSocketConnect(true);
        var socket = new WebSocket("ws://localhost:9000");
        socket.onmessage = function (event) {

            var json = JSON.parse(event.data);
            if (json.namespace === "metrics") {
                triggerHeartBeat();
                heart.removeClass('dead')
                Dropwizard.onMetrics(json.payload);
                $(".hiddenFromStart").css("visibility", "visible");
            } else if (json.namespace === "error") {
                $(".hiddenFromStart").css("visibility", "hidden");
                heart.addClass('dead')
            }
        };

        socket.onerror = function(event) {
            heart.addClass('dead')
            Dropwizard.bindings.connectionError(event);
        };

        socket.onopen = function (event) {
            Dropwizard.bindings.connectionToProxyEstablished(true)
        };

        socket.onclose = function (event) {
            heart.addClass('dead')
            Dropwizard.bindings.connectionToProxyLost(true)
        };
    }
    else {
        alert("Your browser does not support Websockets");
    }

    function triggerHeartBeat() {
        hearts.fadeTo(500, 0.5, function () {
            hearts.fadeTo(1000, 1.0);
        });
    }

    function prettyPrintString(string) {
        string = string.replace("_", " ");
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

}