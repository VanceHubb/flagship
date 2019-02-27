/* tslint:disable:jsx-use-translation-function */
import React, { Component } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import PSScreenWrapper from '../components/PSScreenWrapper';
import { NavigatorStyle, ScreenProps } from '../lib/commonTypes';
import { navBarTabLanding } from '../styles/Navigation';
import { Accordion, AccordionProps } from '@brandingbrand/fscomponents';

type Screen = import ('react-native-navigation').Screen;

export interface AccordionSampleScreenProps extends ScreenProps, AccordionProps {}

const styles = StyleSheet.create({
  section: {
    padding: 15
  }
});

class AccordionSample extends Component<AccordionSampleScreenProps> {
  static navigatorStyle: NavigatorStyle = navBarTabLanding;

  render(): JSX.Element {
    const { navigator } = this.props;
    const title = <Text>Menu Item</Text>;
    const icons = {
      closed: require('../../assets/images/alert.png'),
      open: require('../../assets/images/check.png')
    };
    const content = (
      <View>
        <Text>Sub Menu Item</Text>
      </View>
    );
    const imageContent = (
      <View>
        <Text>Sub Menu Item</Text>
        <Image
          resizeMode='contain'
          source={{ uri: 'https://via.placeholder.com/350x150' }}
          style={{ height: 150, width: 350 }}
        />
      </View>
    );

    return (
      <PSScreenWrapper
        hideGlobalBanner={true}
        navigator={navigator}
      >
        <View style={styles.section}>
          <Accordion
            title={title}
            content={content}
          />
          <Accordion
            title={title}
            content={imageContent}
          />
          <Accordion
            title={title}
            content={content}
            iconFormat={'arrow'}
          />
          <Accordion
            title={title}
            content={content}
            iconFormat={'image'}
            openIconImage={icons.open}
            closedIconImage={icons.closed}
          />
        </View>
      </PSScreenWrapper>
    );
  }

  goTo = (screen: Screen) => () => {
    this.props.navigator.push(screen);
  }
}

export default AccordionSample;
