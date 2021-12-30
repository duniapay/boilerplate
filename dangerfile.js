/**
 * BEFORE EDITING THIS FILE, PLEASE READ http://danger.systems/js/usage/culture.html
 *
 * This file is split into two parts:
 * 1) Rules that require or suggest changes to the code, the PR, etc.
 * 2) Rules that celebrate achievements
 */
import { danger, fail, message, warn } from 'danger';
import { keepachangelog } from 'danger-plugin-keepachangelog';

const bigPRThreshold = 600;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/* ~ Required or suggested changes                                          ~ */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Rule: Exactly 1 reviewer is required.
 * Reason: No reviewer tends to leave a PR in a state where nobody is
 *         responsible. Similarly, more than 1 reviewer doesn't clearly state
 *         who is responsible for the review.
 */
const reviewersCount = danger.github.requested_reviewers.users.length;
if (reviewersCount === 0) {
    fail(`🕵 Whoops, I don't see any reviewers. Remember to add one.`);
} else if (reviewersCount > 1) {
    warn(
        `It's great to have ${reviewersCount} reviewers. Remember though that more than 1 reviewer may lead to uncertainty as to who is responsible for the review.`,
    );
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/* ~ Achievemnts                                                            ~ */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Rule: Celebrate PRs that remove more code than they add.
 * Reason: Less is more!
 */
if (danger.github.pr.deletions > danger.github.pr.additions) {
    message(
        `👏 Great job! I see more lines deleted than added. Thanks for keeping us lean!`,
    );
}

danger.git.commits.forEach((commit) => {
    if (
        !commit.message.match(
            /^(feat:)|(fix:)|(major:)|(chore:)|(docs:)|(ci:)|(refactor:)|(test:)/g,
        )
    ) {
        fail(
            `🔍 Commit message '${commit.message}' does match the correct format`,
        );
    }
});

if (danger.github.pr.additions + danger.github.pr.deletions > bigPRThreshold) {
    warn('Big pull request, please keep small to make it easier to review');
}

const packageChanged = danger.git.modified_files.includes('package.json');
const lockfileChanged = danger.git.modified_files.includes('package-lock.json');
if (packageChanged && !lockfileChanged) {
    warn(
        `🔍 Changes were made to package.json, but not to package-lock.json - <i>'Perhaps you need to run npm install?'</i>`,
    );
}


keepachangelog({ changeVersion: true })
