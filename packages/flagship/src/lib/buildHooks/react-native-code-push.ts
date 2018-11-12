import * as path from '../path';
import * as fs from '../fs';
import * as nativeConstants from '../native-constants';
import {
  logError,
  logInfo
} from '../../helpers';
import { BuildHook } from '../buildHooks';

/**
 * Patches Android for the module.
 *
 * @param {object} configuration The project configuration.
 */

const buildHooks: BuildHook[] = [
  {
    name: 'react-native-code-push android patch',
    platforms: ['android'],
    lifeCycle: 'afterLink',
    packages: [{
      packageName: 'react-native-code-push'
    }],
    // tslint:disable-next-line:cyclomatic-complexity
    script: configuration => {

      if (!(configuration.codepush
        && configuration.codepush.appCenterToken)
      ) {
        logError('codepush.appCenterToken must be specified in project config');
      }

      const assetsPath = path.android.assetsPath();
      const appCenterConfigPath = path.resolve(assetsPath, 'appcenter-config.json');
      const codepush = configuration.codepush;
      const mainApplicationPath = path.android.mainApplicationPath(configuration);

      if (!codepush || !codepush.android) {
        logError('codepush.android needs to be set in the project env');

        process.exit(1);
      } else if (!codepush.android.appKey) {
        logError('codepush.android.appKey needs to be set in the project env');

        process.exit(1);
      } else if (!codepush.android.deploymentKey) {
        logError('codepush.android.deploymentKey needs to be set in the project env');

        process.exit(1);
      } else {

        // Patch build.gradle (react-native link should do this but is broken on linux)
        const reactGradlePath = 'apply from: "../../node_modules/react-native/react.gradle"';
        const codePushGradlePath =
          'apply from: "../../node_modules/react-native-code-push/android/codepush.gradle"';
        const gradlePath = path.android.gradlePath();
        const gradleContent = fs.readFileSync(gradlePath, { encoding: 'utf8' });
        if (gradleContent.indexOf(codePushGradlePath) < 0) {
          logInfo(`patching codepush into build.gradle`);
          fs.writeFileSync(
            gradlePath,
            gradleContent.replace(
              new RegExp(reactGradlePath, 'g'),
              [reactGradlePath, codePushGradlePath].join('\n')
            )
          );
        }

        // Inject the app key
        fs.ensureDirSync(assetsPath);
        fs.writeFileSync(
          appCenterConfigPath,
          JSON.stringify(
            {
              app_secret: codepush.android.appKey
            },
            null,
            2
          )
        );

        // Include the readonly Branding Brand app center token ONLY in development
        // builds
        if (!configuration.disableDevFeature &&
          configuration.codepush &&
          configuration.codepush.appCenterToken
        ) {
          nativeConstants.addAndroid(
            configuration,
            'AppCenterToken',
            configuration.codepush.appCenterToken
          );
        }

        fs.update(
          mainApplicationPath,
          '// [CODEPUSH FUNCTIONS INJECT]',
          `@Override
    public String getJSBundleFile() {
      return CodePush.getJSBundleFile();
    }`
        );
      }
    }
  },
  {
    name: 'react-native-code-push ios patch',
    platforms: ['ios'],
    lifeCycle: 'beforeIOSPodInstall',
    packages: [{
      packageName: 'react-native-code-push'
    }],
    // tslint:disable-next-line:cyclomatic-complexity
    script: configuration => {

      if (!(configuration.codepush
        && configuration.codepush.appCenterToken)
      ) {
        logError('codepush.appCenterToken must be specified in project config');
      }

      const appCenterConfigPath = path.resolve(
        path.ios.nativeProjectPath(configuration),
        'AppCenter-Config.plist'
      );

      if (!configuration.codepush || !configuration.codepush.ios) {
        logError('codepush.ios needs to be set in the project env');

        process.exit(1);
      } else if (!configuration.codepush.ios.appKey) {
        logError('codepush.ios.appKey needs to be set in the project env');

        process.exit(1);
      } else if (!configuration.codepush.ios.deploymentKey) {
        logError('codepush.ios.deploymentKey needs to be set in the project env');

        process.exit(1);
      } else {

        // Inject the app key
        fs.update(appCenterConfigPath, 'CODEPUSH_APP_KEY', configuration.codepush.ios.appKey);

        // Include the readonly Branding Brand app center token ONLY in development
        // builds
        if (!configuration.disableDevFeature &&
          configuration.codepush &&
          configuration.codepush.appCenterToken
        ) {
          nativeConstants.addIOS(configuration, 'AppCenterToken',
            configuration.codepush.appCenterToken);
        }
      }
    }
  }
];

module.exports = buildHooks;
