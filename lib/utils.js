/**
 * Utilities class
 *
 * @module lib/utils
 * @exports Utils
 * @author Julien Roche
 * @version 0.0.1
 * @since 0.0.1
 */

'use strict';

// Imports
const fs = require('fs');
const exec = require('child_process').exec;

const versionOptionsAnalyzer = require('./cli-params');
const rcOptionsRetriever = require('./rc');

// Constants & variables
// Here the class
class Utils {
    /**
     * Load the application parameters
     * @param {string[]} cliParams
     * @return {VersionOptions}
     */
    static paramsLoader(cliParams) {
        let baseOptions = rcOptionsRetriever();
        return versionOptionsAnalyzer(cliParams, baseOptions);
    }

    /**
     * @param {string} command
     * @param {boolean} [silent=false]
     * @returns {Promise}
     */
    static promisedExec(command, silent) {
        return new Promise(function (resolve, reject) {
            let instance = exec(command, (error) => {
                if (error) {
                    reject(error);

                } else {
                    resolve();
                }
            });

            if (!silent) {
                instance.stdout.on('data', function(data) {
                    console.log(data);
                });

                instance.stderr.on('data', function (data) {
                    console.error(data);
                });
            }
        });
    }

    /**
     * @param {string} filePath
     * @returns {Promise}
     */
    static readFile(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    reject(err);

                } else {
                    resolve(content.toString());
                }
            });
        });
    }

    /**
     * @param {string} content
     * @param {string} propertyName
     * @param {string} value
     * @returns {string}
     */
    static replaceJsonProperty(content, propertyName, value) {
        let propertyToFound = `"${propertyName}"`;
        let indexPropertyToFound = content.indexOf(propertyToFound);

        if (indexPropertyToFound >= 0) {
            let startIndex = content.indexOf('"', indexPropertyToFound + propertyToFound.length);
            let startExtract = content.substr(0, startIndex + 1);
            let endExtract = content.substr(startIndex + 1);
            endExtract = endExtract.substr(endExtract.indexOf('"'));

            return `${startExtract}${value}${endExtract}`;
        }

        return content;
    }

    /**
     * @param {string} content
     * @param {string} value
     * @returns {string}
     */
    static replaceJsonVersionProperty(content, value) {
        return Utils.replaceJsonProperty(content, 'version', value);
    }

    /**
     * @param {string} filePath
     * @returns {Promise}
     */
    static writeFile(filePath, content) {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, content, (err) => {
                if (err) {
                    reject(err);

                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = Utils;
