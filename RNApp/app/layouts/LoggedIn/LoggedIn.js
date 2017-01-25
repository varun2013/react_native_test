import React from 'react';
import { Image,StyleSheet,Alert, Text, View, Animated, Component, PanResponder,} from 'react-native';
import TabNavigator from 'react-native-tab-navigator';
import ExNavigator from '@exponent/react-native-navigator';
import Routes from '../../config/routes';
import images from '../../config/images';
import clamp from 'clamp';

 /* set card data */
const CardDetail = [
  {title:'Test Card 1',description:'dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry text ever since the 1500s, when an unknown'},
  {title:'Test Card 2',description:'dummy text of the printing and typesetting industry. Lorstandard dummy text ever since the 1500s, when an unknown'},
  {title:'Test Card 3',description:'dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since'},
  {title:'Test Card 4',description:'dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy when an unknown'},
  {title:'Test Card 5',description:'dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry since the 1500s, when an unknown'},
]

var SWIPE_THRESHOLD = 120;


class LoggedIn extends React.Component {
  constructor(props) {
    super(props);
    /* set initial state */
    this.state = { 
      pan: new Animated.ValueXY(),
      enter: new Animated.Value(0.5),
      card: CardDetail[0],
    };
  }

 /* function to move card next and prev */
   _goToNextCard(movedTo) {
   
    let currentCardIdx = CardDetail.indexOf(this.state.card);
    let newIdx = currentCardIdx + movedTo;
    if(newIdx < 0){
      newIdx=0;
    }else if(newIdx >=CardDetail.length - 1 ){
      newIdx=CardDetail.length - 1;
    }

    this.setState({
      card: CardDetail[newIdx]
    });
  }

  componentDidMount() {
    /* animate card on screen mount */
    this._animateEntrance();
  }

 /* function to animate card  */
  _animateEntrance() {
    Animated.spring(
      this.state.enter,
      { toValue: 1, friction: 8 }
    ).start();
  }

 
  componentWillMount() {
    this._panResponder = PanResponder.create({
      onMoveShouldSetResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,

      onPanResponderGrant: (e, gestureState) => {
        this.state.pan.setOffset({x: this.state.pan.x._value, y: this.state.pan.y._value});
        this.state.pan.setValue({x: 0, y: 0});
      },

      onPanResponderMove: Animated.event([
        null, {dx: this.state.pan.x, dy: this.state.pan.y},
      ]),

      /* function to handle swipe event */
      onPanResponderRelease: (e, {vx, vy}) => {
        this.state.pan.flattenOffset();
        var velocity;
        var movedTo=1;
        if (vx >= 0) {
          movedTo=-1;
          velocity = clamp(vx, 3, 5);
        } else if (vx < 0) {
          movedTo=1;
          velocity = clamp(vx * -1, 3, 5) * -1;
        }

        if (Math.abs(this.state.pan.x._value) > SWIPE_THRESHOLD) {          
          Animated.decay(this.state.pan, {
            velocity: {x: velocity, y: vy},
            deceleration: 0.98
          }).start(this._resetState.bind(this,movedTo))
        } else {          
          Animated.spring(this.state.pan, {
            toValue: {x: 0, y: 0},
            friction: 4
          }).start()
        }
      }
    })
  }

 /* function to reset satate and change card */
  _resetState(movedTo) {
    this.state.pan.setValue({x: 0, y: 0});
    this.state.enter.setValue(0);
    this._goToNextCard(movedTo);
    this._animateEntrance();
  }
 
  renderTabItem(title, initialRoute, Icon) {
    const { selectedTab } = this.state;
    const sceneStyle = [];
    if (initialRoute.showNavigationBar !== false) {
      sceneStyle.push({ paddingTop: 64 });
    }


    return (
      <TabNavigator.Item
        selected={selectedTab === title}
        title={title}
        renderIcon={() => <Image style={styles.icon} source={Icon} />}
        renderSelectedIcon={() => (
          <Image
            style={[styles.icon, styles.iconSelected]}
            source={Icon}
          />
        )}
        onPress={() => this.setState({ selectedTab: title })}
      >
        <ExNavigator
          initialRoute={initialRoute}
          style={{ flex: 1 }}
          sceneStyle={sceneStyle}
          showNavigationBar={initialRoute.showNavigationBar}
        />
      </TabNavigator.Item>
    );
  }

  render() {
    /* set animation for card */

    let { pan, enter, } = this.state;
    let [translateX, translateY] = [pan.x, pan.y];
    let rotate = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: ["-30deg", "0deg", "30deg"]});
    let opacity = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: [0.5, 1, 0.5]})
    let scale = enter;
    let animatedCardStyles = {transform: [{translateX}, {translateY}, {rotate}, {scale}], opacity};  
    
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.card, animatedCardStyles]} {...this._panResponder.panHandlers}>
        <Text>{this.state.card.title}</Text>
        <Text>{this.state.card.description}</Text>
        </Animated.View>
        
      </View>
    );
  }
}

  /* style */

var styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    width: 300,
    height: 300,
    padding: 10,
    backgroundColor:'#dcdcdc',
    shadowOffset:{
            width: 5,
            height: 5,
        },
    shadowColor: '#696969',
    shadowOpacity: 2.0
  }
});


export default LoggedIn;
