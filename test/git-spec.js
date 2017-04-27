/**
 * Git utils tests
 *
 * @module test/git-spec
 * @author Julien Roche
 * @version 0.0.1
 * @since 0.0.1
 */

'use strict';

const importLib = require('./importLib');

describe(`GitUtils${importLib.getContext()} - `, function () {
    const expect = require('chai').expect;
    const sinon = require('sinon');
    const GitUtils = importLib('git');
    const Utils = importLib('utils');

    let sinonSandBox = null;

    it('should exports something', function () {
        expect(GitUtils).to.exist;
    });

    describe('and the method "createCommitLabel" ', function () {
        it('should exist', function () {
            expect(GitUtils.createCommitLabel).to.exist;
        });

        it('should return a default value if no label set', function () {
            expect(GitUtils.createCommitLabel('1.2.3')).equals('Release version: 1.2.3');
        });

        it('should inject the package version if a label is set', function () {
            expect(GitUtils.createCommitLabel('1.2.3', 'Release: %s')).equals('Release: 1.2.3');
        });

        it('should escape the double quote if a label is set', function () {
            expect(GitUtils.createCommitLabel('1.2.3', 'Release: "%s"')).equals('Release: \\"1.2.3\\"');
        });
    });

    describe('and the method "createTagLabel" ', function () {
        it('should exist', function () {
            expect(GitUtils.createTagLabel).to.exist;
        });

        it('should return a default value if no label set', function () {
            expect(GitUtils.createTagLabel('1.2.3')).equals('v1.2.3');
        });

        it('should inject the package version if a label is set', function () {
            expect(GitUtils.createTagLabel('1.2.3', '%s')).equals('1.2.3');
        });

        it('should escape the double quote if a label is set', function () {
            expect(GitUtils.createTagLabel('1.2.3', 'Version "%s"')).equals('Version \\"1.2.3\\"');
        });
    });

    beforeEach(function () {
        sinonSandBox = sinon.sandbox.create();
    });

    afterEach(function () {
        sinonSandBox && sinonSandBox.restore();
        sinonSandBox = null;
    });

    describe('and the method "hasGitInstalled" ', function () {
        it('should exist', function () {
            expect(GitUtils.hasGitInstalled).to.exist;
        });

        it('should return false if the git command is not recognized', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.reject('command not recognized'));

            return GitUtils
                .hasGitInstalled()
                .then(function (status) {
                    expect(status).to.be.false;
                });
        });

        it('should return true otherwise', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());

            return GitUtils
                .hasGitInstalled()
                .then(function (status) {
                    expect(status).to.be.true;
                });
        });
    });

    describe('and the method "hasGitProject" ', function () {
        it('should exist', function () {
            expect(GitUtils.hasGitProject).to.exist;
        });

        it('should return false if the cwd is not into a git project', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.reject('fatal: Not a git repository (or any of the parent directories): .git'));

            return GitUtils
                .hasGitProject()
                .then(function (status) {
                    expect(status).to.be.false;
                });
        });

        it('should return true otherwise', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());

            return GitUtils
                .hasGitProject()
                .then(function (status) {
                    expect(status).to.be.true;
                });
        });

        it('should use per default the process.cwd', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());
            return GitUtils
                .hasGitProject()
                .then(() => {
                    expect(promiseExecStub.calledWithExactly('git status --porcelain', true, undefined)).to.be.true;
                });
        });

        it('should use  the specified cwd', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());
            return GitUtils
                .hasGitProject('/etc')
                .then(() => {
                    expect(promiseExecStub.calledWithExactly('git status --porcelain', true, '/etc')).to.be.true;
                });
        });
    });

    describe('and the method "getBranchName" ', function () {
        it('should exist', function () {
            expect(GitUtils.getBranchName).to.exist;
        });

        it('should return the branch name', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve('releases/1.0.0'));

            return GitUtils
                .getBranchName()
                .then(function (remoteName) {
                    expect(remoteName).equals('releases/1.0.0');
                });
        });

        it('should use the specified cwd', function () {
            let getBranchNameStub = sinonSandBox.stub(GitUtils, 'getBranchName', () => Promise.resolve('releases/1.0.0'));

            return GitUtils
                .getBranchName('/etc')
                .then(function () {
                    expect(getBranchNameStub.calledWithExactly('/etc')).to.be.true;
                });
        });
    });

    describe('and the method "getRemoteName" ', function () {
        it('should exist', function () {
            expect(GitUtils.getRemoteName).to.exist;
        });

        it('should return the origin name', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve('origin'));

            return GitUtils
                .getRemoteName()
                .then(function (remoteName) {
                    expect(remoteName).equals('origin');
                });
        });

        it('should use the specified cwd', function () {
            let getRemoteNameStub = sinonSandBox.stub(GitUtils, 'getRemoteName', () => Promise.resolve('origin'));

            return GitUtils
                .getRemoteName('/etc')
                .then(function () {
                    expect(getRemoteNameStub.calledWithExactly('/etc')).to.be.true;
                });
        });
    });

    describe('and the method "isBranchUpstream" ', function () {
        it('should exist', function () {
            expect(GitUtils.isBranchUpstream).to.exist;
        });

        it('should return false if an error occured (1)', function () {
            sinonSandBox.stub(Utils, 'promisedExec', () => Promise.reject());
            sinonSandBox.stub(GitUtils, 'getRemoteName', () => Promise.resolve('origin'));

            return GitUtils
                .isBranchUpstream('releases/1.0.0')
                .then(function (isBranchUpstream) {
                    expect(isBranchUpstream).to.be.false;
                });
        });

        it('should return false if an error occured (2)', function () {
            sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve(''));
            sinonSandBox.stub(GitUtils, 'getRemoteName', () => Promise.reject());

            return GitUtils
                .isBranchUpstream('releases/1.0.0')
                .then(function (isBranchUpstream) {
                    expect(isBranchUpstream).to.be.false;
                });
        });

        it('should return false if no remote branches', function () {
            sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve(''));
            sinonSandBox.stub(GitUtils, 'getRemoteName', () => Promise.resolve('origin'));

            return GitUtils
                .isBranchUpstream('releases/1.0.0')
                .then(function (isBranchUpstream) {
                    expect(isBranchUpstream).to.be.false;
                });
        });

        it('should return false if the local branch has no associated remote branch', function () {
            sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve(''));
            sinonSandBox.stub(GitUtils, 'getRemoteName', () => Promise.resolve(`origin/HEAD          -> origin/master
  origin/master        ec904e9 Last commiy
  origin/release/0.9.0 f35d72b use of babel-preset-env instead
`));

            return GitUtils
                .isBranchUpstream('releases/1.0.0')
                .then(function (isBranchUpstream) {
                    expect(isBranchUpstream).to.be.false;
                });
        });

        it('should return true otherwise', function () {
            sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve(''));
            sinonSandBox.stub(GitUtils, 'getRemoteName', () => Promise.resolve(`origin/HEAD          -> origin/master
  origin/master        ec904e9 Last commiy
  origin/release/1.0.0 f35d72b use of babel-preset-env instead
`));

            return GitUtils
                .isBranchUpstream('releases/1.0.0')
                .then(function (isBranchUpstream) {
                    expect(isBranchUpstream).to.be.false;
                });
        });

        it('should use the specified cwd', function () {
            let getRemoteName = sinonSandBox.stub(GitUtils, 'getRemoteName', () => Promise.resolve('origin'));
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());

            return GitUtils
                .isBranchUpstream('releases/1.0.0', '/etc')
                .then(function () {
                    expect(promiseExecStub.calledWithExactly('git branch -rvv', true, '/etc')).to.be.true;
                    expect(getRemoteName.calledWithExactly('/etc')).to.be.true;
                });
        });
    });

    describe('and the method "push" ', function () {
        it('should exist', function () {
            expect(GitUtils.push).to.exist;
        });

        it('should not push the tags if not specified', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());

            return GitUtils
                .push(false)
                .then(function () {
                    expect(promiseExecStub.calledWithExactly('git push', false, undefined)).to.be.true;
                });
        });

        it('should push the tags otherwise', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());

            return GitUtils
                .push(true)
                .then(function () {
                    expect(promiseExecStub.calledWithExactly('git push && git push --tags', false, undefined)).to.be.true;
                });
        });

        it('should use per default the process.cwd', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());
            return GitUtils
                .push(false)
                .then(() => {
                    expect(promiseExecStub.calledWithExactly('git push', false, undefined)).to.be.true;
                });
        });

        it('should use  the specified cwd', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());
            return GitUtils
                .push(false, '/etc')
                .then(() => {
                    expect(promiseExecStub.calledWithExactly('git push', false, '/etc')).to.be.true;
                });
        });
    });

    describe('and the method "addFile" ', function () {
        it('should exist', function () {
            expect(GitUtils.addFile).to.exist;
        });

        it('should create add the file in git', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());

            return GitUtils
                .addFile('bower.json')
                .then(function () {
                    expect(promiseExecStub.calledWithExactly('git add bower.json', false, undefined)).to.be.true;
                });
        });

        it('should use per default the process.cwd', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());
            return GitUtils
                .addFile('bower.json')
                .then(() => {
                    expect(promiseExecStub.calledWithExactly('git add bower.json', false, undefined)).to.be.true;
                });
        });

        it('should use  the specified cwd', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());
            return GitUtils
                .addFile('bower.json', '/etc')
                .then(() => {
                    expect(promiseExecStub.calledWithExactly('git add bower.json', false, '/etc')).to.be.true;
                });
        });
    });

    describe('and the method "createCommit" ', function () {
        it('should exist', function () {
            expect(GitUtils.createCommit).to.exist;
        });

        it('should create a git commit', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());

            return GitUtils
                .createCommit('1.2.3', 'Change version to %s')
                .then(function () {
                    expect(promiseExecStub.calledWithExactly('git commit --all --message "Change version to 1.2.3"', false, undefined)).to.be.true;
                });
        });

        it('should use per default the process.cwd', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());
            return GitUtils
                .createCommit('1.2.3', 'Change version to %s')
                .then(() => {
                    expect(promiseExecStub.calledWithExactly('git commit --all --message "Change version to 1.2.3"', false, undefined)).to.be.true;
                });
        });

        it('should use  the specified cwd', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());
            return GitUtils
                .createCommit('1.2.3', 'Change version to %s', '/etc')
                .then(() => {
                    expect(promiseExecStub.calledWithExactly('git commit --all --message "Change version to 1.2.3"', false, '/etc')).to.be.true;
                });
        });
    });

    describe('and the method "createTag" ', function () {
        it('should exist', function () {
            expect(GitUtils.createTag).to.exist;
        });

        it('should create a git tag', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());

            return GitUtils
                .createTag('1.2.3', 'v%s')
                .then(function () {
                    expect(promiseExecStub.calledWithExactly('git tag "v1.2.3"', false, undefined)).to.be.true;
                });
        });

        it('should use per default the process.cwd', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());
            return GitUtils
                .createTag('1.2.3', 'v%s')
                .then(() => {
                    expect(promiseExecStub.calledWithExactly('git tag "v1.2.3"', false, undefined)).to.be.true;
                });
        });

        it('should use  the specified cwd', function () {
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());
            return GitUtils
                .createTag('1.2.3', 'v%s', '/etc')
                .then(() => {
                    expect(promiseExecStub.calledWithExactly('git tag "v1.2.3"', false, '/etc')).to.be.true;
                });
        });
    });


    describe('and the method "upstreamCurrentBranch" ', function () {
        it('should exist', function () {
            expect(GitUtils.upstreamCurrentBranch).to.exist;
        });

        it('should push the branch to remote', function () {
            sinonSandBox.stub(GitUtils, 'getRemoteName', () => Promise.resolve('origin'));
            sinonSandBox.stub(GitUtils, 'getBranchName', () => Promise.resolve('releases/1.0.0'));
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());

            return GitUtils
                .upstreamCurrentBranch()
                .then(function () {
                    expect(promiseExecStub.calledWithExactly('git push --set-upstream origin releases/1.0.0', false, undefined)).to.be.true;
                });
        });

        it('should use the specified cwd', function () {
            let getRemoteNameStub = sinonSandBox.stub(GitUtils, 'getRemoteName', () => Promise.resolve('origin'));
            let getBranchNameStub = sinonSandBox.stub(GitUtils, 'getBranchName', () => Promise.resolve('releases/1.0.0'));
            let promiseExecStub = sinonSandBox.stub(Utils, 'promisedExec', () => Promise.resolve());

            return GitUtils
                .upstreamCurrentBranch('/etc')
                .then(function () {
                    expect(getRemoteNameStub.calledWithExactly('/etc')).to.be.true;
                    expect(getBranchNameStub.calledWithExactly('/etc')).to.be.true;
                    expect(promiseExecStub.calledWithExactly('git push --set-upstream origin releases/1.0.0', false, '/etc')).to.be.true;
                });
        });
    });
});
