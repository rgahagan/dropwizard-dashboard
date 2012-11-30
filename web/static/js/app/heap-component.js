(function() {

    var component = {
        name                : "Heap",
        shortDescription    : "Utilization",
        dom_id              : "jvm_heap_container"
    };

    var chartOptions = {
        grid: {
            strokeStyle:'rgb(240, 240, 240)',
            fillStyle:'rgb(250, 250, 250)',
            lineWidth: 1,
            millisPerLine: 1000,
            verticalSections: 4
        },
        labels: {
            fillStyle:'rgb(0, 0, 0)'
        },
        resetBounds : false,
        minValue: 0,
        maxValue: 1
    };

    function HeapBindings() {
        var self = this;

        self.virtualMachineHeap = ko.observable();

        self.readableMachineHeap = ko.computed(function() {
            var readable = {};
            var heaps = self.virtualMachineHeap();
            for (var name in heaps) {
                var usageInBytes = heaps[name];
                readable[name] = bytesToSize(usageInBytes);
            }

            return readable;
        });
    }

    var bindings = new HeapBindings;
    var used = new TimeSeries();

    var updateSmoothieChart = function(heap) {
        used.append(heap.time, heap.used / heap.max);
    };

    Dropwizard.registerComponent({
        bindings : bindings,
        pageComponent : component,

        onMetrics : function(update) {
            var memory = update.jvm.memory;
            bindings.virtualMachineHeap({
                init        : memory.heapInit,
                used        : memory.heapUsed,
                committed   : memory.heapCommitted,
                max         : memory.heapMax,
                time        : update.jvm.current_time
            })
        },

        /**
         * Download and install the heap page component template and install it to
         * activate Knockout.js data binding.
         */
        beforeSocketConnect : function() {
            Dropwizard.installRemoteTemplate("heap-template", "/static/templates/heap.html");
            Dropwizard.appendTemplateTo("heap-template", document.getElementById(component.dom_id));

            var smoothie = new SmoothieChart(chartOptions);
            smoothie.streamTo(document.getElementById("jvm_heap_smoothie_chart"), 1300);
            smoothie.addTimeSeries(used, {
                strokeStyle:'rgb(70, 70, 70)',
                fillStyle:'rgba(70, 70, 70, 0.2)',
                lineWidth:2
            });

            bindings.virtualMachineHeap.subscribe(updateSmoothieChart);
        }
    });


    function bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return 'n/a';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

})();