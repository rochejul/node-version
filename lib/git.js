/**
 * Git utilities class
 *
 * @module lib/git
 * @exports GitUtils
 * @author Julien Roche
 * @version 0.0.1
 * @since 0.0.1
 */

'use strict';

// Imports
const Utils = require('./utils');

// Constants
const ESCAPE_DOUBLE_QUOTE = '\\"';
const REGEX = {
    'PURCENTAGE_STRING': /%s/g,
    'DOUBLE_QUOTE': /"/g
};

const ERRORS = Object.freeze({
    'NoBranchGitError': class NoBranchGitError extends Error {
        constructor() {
            super('No branch Git seems to be declared');
            this.name = 'NoBranchGitError';
        }
    },
    'NoRemoteGitError': class NoRemoteGitError extends Error {
        constructor() {
            super('No remote Git seems to be declared');
            this.name = 'NoRemoteGitError';
        }
    },
    'MultipeRemoteGitError': class MultipeRemoteGitError extends Error {
        constructor() {
            super('Multiple remote Git have been detected');
            this.name = 'MultipeRemoteGitError';
        }
    }
});

// Here the class
class GitUtils {
    /**
     * @param {string} filePath
     * @param {string} [cwd]
     * @returns {Promise}
     */
    static addFile(filePath, cwd) {
        return Utils.promisedExec(`git add ${filePath}`, false, cwd);
    }

    /**
     * Create a commit git
     * @param {string} packageVersion
     * @param {string} [label]
     * @param {string} [cwd]
     * @returns {Promise}
     */
    static createCommit(packageVersion, label, cwd) {
        return Utils.promisedExec(`git commit --all --message "${GitUtils.createCommitLabel(packageVersion, label)}"`, false, cwd);
    }

    /**
     * Generate the commit description
     * @param {string} packageVersion
     * @param {string} [label]
     * @returns {string}
     */
    static createCommitLabel(packageVersion, label) {
        if (label) {
            return label
                .replace(REGEX.PURCENTAGE_STRING, packageVersion)
                .replace(REGEX.DOUBLE_QUOTE, ESCAPE_DOUBLE_QUOTE);
        }

        return `Release version: ${packageVersion}`;
    }

    /**
     * Create a tag git
     * @param {string} packageVersion
     * @param {string} [label]
     * @param {string} [cwd]
     * @returns {Promise}
     */
    static createTag(packageVersion, label, cwd) {
        return Utils.promisedExec(`git tag "${GitUtils.createTagLabel(packageVersion, label)}"`, false, cwd);
    }

    /**
     * Generate the tag description
     * @param {string} packageVersion
     * @param {string} [label]
     * @returns {string}
     */
    static createTagLabel(packageVersion, label) {
        if (label) {
            return label
                .replace(REGEX.PURCENTAGE_STRING, packageVersion)
                .replace(REGEX.DOUBLE_QUOTE, ESCAPE_DOUBLE_QUOTE);
        }

        return `v${packageVersion}`;
    }

    /**
     * @returns {Promise.<boolean>}
     */
    static hasGitInstalled() {
        return Utils
            .promisedExec('git --help', true)
            .then(() => true)
            .catch(() => false);
    }

    /**
     * @param {string} [cwd]
     * @returns {Promise.<boolean>}
     */
    static hasGitProject(cwd) {
        return Utils
            .promisedExec('git status --porcelain', true, cwd)
            .then(() => true)
            .catch(() => false);
    }

    /**
     * @param {string} [cwd]
     * @returns {Promise.<string | NoBranchGitError>}
     */
    static getBranchName(cwd) {
        return Utils
            .promisedExec('git rev-parse --abbrev-ref HEAD', true, cwd)
            .then(outputData => outputData ? outputData : Promise.reject(new ERRORS.NoBranchGitError()));
    }

    /**
     * @param {string} [cwd]
     * @returns {Promise.<string | NoRemoteGitError | MultipeRemoteGitError>}
     */
    static getRemoteName(cwd) {
        return GitUtils
            .getRemoteNameList(cwd)
            .then(remotes => {
                if (remotes.length === 1) {
                    return remotes[0];

                } else if (remotes.length > 1) {
                    return Promise.reject(new ERRORS.MultipeRemoteGitError());
                }

                return Promise.reject(new ERRORS.NoRemoteGitError());
            });
    }

    /**
     * @param {string} [cwd]
     * @returns {Promise.<string[]>}
     */
    static getRemoteNameList(cwd) {
        return Utils
            .promisedExec('git origin', true, cwd)
            .then(ouputData => Utils.splitByEndOfLine(ouputData));
    }

    /**
     * @param {string} [cwd]
     * @returns {Promise.<boolean>}
     */
    static isCurrentBranchUpstream(cwd) {
        return GitUtils
            .getBranchName(cwd)
            .then(branchName => GitUtils.isBranchUpstream(branchName, cwd));
    }

    /**
     * @param {string} branchName
     * @param {string} [cwd]
     * @returns {Promise.<boolean>}
     */
    static isBranchUpstream(branchName, cwd) {
        return Promise
            .all([
                Utils.promisedExec('git branch -rvv', true, cwd),
                GitUtils.getRemoteName(cwd)
            ])
            .then(results => {
                let remoteBrancheLines = Utils.splitByEndOfLine(results[0]);
                let remoteName = results[1];
                let remoteBranch = `${remoteName}/${branchName}`;

                return remoteBrancheLines.find(remoteBranchLine => remoteBranchLine.indexOf(remoteBranch) >= 0);
            })
            .then(remoteBranchLine => !!remoteBranchLine)
            .catch(() => false);
    }

    /**
     * Push the commits and the tags if needed
     * @param {boolean} [tags=false]
     * @param {string} [cwd]
     * @returns {Promise}
     */
    static push(tags, cwd) {
        return Utils.promisedExec(`git push${tags ? ' && git push --tags' : ''}`, false, cwd);
    }

    /**
     * Push the branch if needed
     * @maran {string} remoteName
     * @maran {string} branchName
     * @param {string} [cwd]
     * @returns {Promise}
     */
    static upstreamBranch(remoteName, branchName, cwd) {
        return Utils.promisedExec(`git push --set-upstream ${remoteName} ${branchName}`, false, cwd);
    }
};

/**
 * @name ERRORS
 * @memberof GitUtils
 */
Object.defineProperty(GitUtils, 'ERRORS', { 'writable': false, 'value': ERRORS });

module.exports = GitUtils;
