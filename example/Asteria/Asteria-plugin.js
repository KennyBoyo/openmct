
define([
    //"./AsteriaLimitProvider_Test",
], function (
    //AsteriaLimitProvider
) {

    function AsteriaPlugin() {

        function getAsteriaDictionary() {
            return fetch('./example/Asteria/Asteriadictionary.json').then(function (response) {
                return response.json();
            });

        }

        // An object provider builds Domain Objects
        var Asteria_objectProvider = {
            get: function (identifier) {
                return getAsteriaDictionary().then(function (dictionary) {
                    //console.log("Asteria-dictionary-plugin.js: identifier.key = " + identifier.key);
                    if (identifier.key === 'Asteria') {
                        return {
                            identifier: identifier,
                            name: dictionary.name,
                            type: 'folder',
                            location: 'ROOT'
                        };
                    } else {
                        var measurement = dictionary.measurements.filter(function (m) {
                            return m.key === identifier.key;
                        })[0];

                        return {
                            identifier: identifier,
                            name: measurement.name,
                            type: 'Asteria.telemetry',
                            telemetry: {
                                values: measurement.values
                            },
                            location: 'Asteria.taxonomy:Asteria'
                        };
                    }
                });
            }
        };

        // The composition of a domain object is the list of objects it contains, as shown (for example) in the tree for browsing.
        // Can be used to populate a hierarchy under a custom root-level object based on the contents of a telemetry dictionary.
        // "appliesTo"  returns a boolean value indicating whether this composition provider applies to the given object
        // "load" returns an array of Identifier objects (like the channels this telemetry stream offers)
        var Asteria_compositionProvider = {
            appliesTo: function (domainObject) {
                return domainObject.identifier.namespace === 'Asteria.taxonomy'
                    && domainObject.type === 'folder';
            },
            load: function (domainObject) {
                return getAsteriaDictionary()
                    .then(function (dictionary) {
                        return dictionary.measurements.map(function (m) {
                            return {
                                namespace: 'Asteria.taxonomy',
                                key: m.key
                            };
                        });
                    });
            }
        };

        return function install(openmct) {
            // The addRoot function takes an "object identifier" as an argument
            openmct.objects.addRoot({
                namespace: 'Asteria.taxonomy',
                key: 'Asteria'
            });

            openmct.objects.addProvider('Asteria.taxonomy', Asteria_objectProvider);

            openmct.composition.addProvider(Asteria_compositionProvider);

            //openmct.telemetry.addProvider(new AsteriaLimitProvider());

            openmct.types.addType('Asteria.telemetry', {
                name: 'Asteria Telemetry Point',
                description: 'Telemetry of Asteria',
                cssClass: 'icon-telemetry'
            });
        };
    }

    return AsteriaPlugin;
});
