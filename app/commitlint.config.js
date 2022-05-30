module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'references-empty': [2, 'never'],
    'subject-case': [0],
  },
  parserPreset: {
    parserOpts: {
      issuePrefixes: ['FIS-', 'TSE-', 'TR-', 'DAPI-', 'DEV-', 'DSF-', 'FIMP-'],
    },
  },
};
