(function() {

    var component = {
        name                : "Widget",
        shortDescription    : "GET/POST and timing",
        dom_id              : "metrics_container"
    };

    var chartOptions = {
        grid: {
            strokeStyle:'rgb(240, 240, 240)',
            fillStyle:'rgb(250, 250, 250)',
            lineWidth: 1,
            millisPerLine: 1000,
            verticalSections: 10
        },
        labels: {
            fillStyle:'rgb(0, 0, 0)'
        },
        resetBounds : false,
        minValue: 0,
        maxValue: 0.1
    };

    function MetricsBindings() {
        var self = this;

        self.widgetMetrics = ko.observable({
            create_count    : 0,
            create_avg_time : 0,
            get_count       : 0,
            get_avg_time    : 0,
            get_all_mean    : 0,
            time            : 0
        });
    }

    var bindings = new MetricsBindings;
    var used = new TimeSeries();

    var updateSmoothieChart = function(metrics) {
        used.append(metrics.time, metrics.get_all_mean);
    };

    Dropwizard.registerComponent({
        bindings : bindings,
        pageComponent : component,

        onMetrics : function(update) {
            var resource = update["com.bloomhealthco.radiant.service.template.resources.WidgetResource"];
            bindings.widgetMetrics({
                create_count    : resource.createWidget.rate.count,
                create_avg_time : Math.round(resource.createWidget.duration.mean),
                get_count       : resource.getWidgets.rate.count,
                get_avg_time    : Math.round(resource.getWidgets.duration.mean),
                get_all_mean    : resource.getWidgets.rate.mean,
                time            : update.jvm.current_time
            })
        },

        /**
         * Download and install the metrics page component template and install it to
         * activate Knockout.js data binding.
         */
        beforeSocketConnect : function() {
            Dropwizard.installRemoteTemplate("metrics-template", "/static/templates/metrics.html");
            Dropwizard.appendTemplateTo("metrics-template", document.getElementById(component.dom_id));

            var smoothie = new SmoothieChart(chartOptions);
            smoothie.streamTo(document.getElementById("metrics_smoothie_chart"), 1300);
            smoothie.addTimeSeries(used, {
                strokeStyle:'rgb(70, 70, 70)',
                fillStyle:'rgba(70, 70, 70, 0.2)',
                lineWidth:2
            });

            bindings.widgetMetrics.subscribe(updateSmoothieChart);
        }
    });

})();