'use strict';

const EventEmitter = require('events');
const Promise = require('bluebird');
const githubApi = require('lib/libs/githubApi');
const _ = require('underscore');

const appConfig = require('src/config/appConfig');
const logger = require('lib/modules/logger');

const EVENTS = {
  UPDATE_AVAILABLE: 'update-available'
};

/** @exports AutoUpdater */
/**
 * @property newestRelease - the newest release, if available
 */
class AutoUpdater extends EventEmitter {
  /** @method */
  /**
   * @return Promise
   */
  checkForUpdates() {
    return new Promise((resolve, reject) => {
      githubApi.listReleases(appConfig.repositoryOwner, appConfig.repositoryName)
        .then(releases => {
          let newRelease = _getNewestRelease(releases, appConfig.version);
          let releaseAvailable = newRelease ? true : false;

          if (releaseAvailable) this.emit(this.EVENTS.UPDATE_AVAILABLE, newRelease);

          console.log('UPDATE_AVAILABLE', newRelease);

          return resolve(releaseAvailable);
        })
        .catch(reject);
    });
  }

  get EVENTS() {
    return EVENTS;
  }

  get newestRelease() {
    return this._newestRelease;
  }
}

function _getNewestRelease(releases, currentVersion) {
  releases = _.sortBy(releases, 'version');

  let currentRelease = _.findWhere(releases, {
    name: `v${currentVersion}` //TODO: shouldn't have to use the naming pattern 'v1.0.0'
  });

  if (!currentRelease) {
    logger.warn(`autoupdater - checkForUpdates() - no release matches the name v${currentRelease}`);
    return null;
  }

  let currentReleaseIndex = releases.indexOf(currentRelease);

  if (currentReleaseIndex !== 0) {
    let latestRelease = releases[0];
    return latestRelease;
  } else {
    return null;
  }
}

module.exports = new AutoUpdater();
