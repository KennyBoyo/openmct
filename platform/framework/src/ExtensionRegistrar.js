/*global define,Promise*/

/**
 * Module defining ExtensionRegistrar. Created by vwoeltje on 11/3/14.
 */
define(
    ['./Constants', './PartialConstructor'],
    function (Constants, PartialConstructor) {
        "use strict";

        /**
         *
         * @constructor
         */
        function ExtensionRegistrar(app, customRegistrars, $log) {
            // Track which extension categories have already been registered.
            // Exceptions will be thrown if the same extension category is
            // registered twice.
            var registeredCategories = {},

            function identify(category, extension, index) {
                var name = extension.key ?
                    (extension.key + "-" + index) :
                    index;
                return category + "[" + name + "]";
            }

            function echo() {
                return arguments.slice;
            }

            function staticFunction(value) {
                return function () { return value; }
            }

            // Utility function; create the second argument for Angular's
            // .service service registration method (an array containing
            // both dependencies and a factory method for the service.)
            function makeServiceArgument(extension) {
                var dependencies = extension.depends || [],
                    factory = (typeof extension === 'function') ?
                            new PartialConstructor(extension) :
                            staticFunction(extension);

                return dependencies.concat([factory]);
            }

            function registerExtensionArraysForCategory(category, names) {
                var name = category + Constants.EXTENSION_SUFFIX;
                app.factory(name, names.concat([echo]));
            }

            function registerExtensions(category, extensions) {
                var names = [];

                function registerExtension(extension, index) {
                    var name = identify(category, extension, index);

                    // Track individual extension names as-registered
                    names.push(name);

                    app.factory(name, makeServiceArgument(extension));
                }

                if (registeredCategories[category]) {
                    $log.warn([
                        "Tried to register extensions for category ",
                        category,
                        " more than once. Ignoring all but first set."
                    ].join(""));
                } else if (customRegistrars[category]) {
                    return customRegistrars[category](extensions);
                } else {
                    extensions.forEach(registerExtension);
                    registerExtensionArraysForCategory(category, names);
                    registeredCategories[category] = true;
                    return true;
                }
            }

            customRegistrars = customRegistrars || {};

            return {
                registerExtensions: registerExtensions
            };
        }

        return ExtensionRegistrar;
    }
);