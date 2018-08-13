import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeModules, LayoutAnimation, TouchableNativeFeedback, Text, PanResponder, Animated } from 'react-native'

const { UIManager } = NativeModules
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const createMockCollection = nb => Array.apply(null, {length: nb }).map(Number.call, Number)

const DATA = [
  createMockCollection(5),
  createMockCollection(5)
]

class Panel extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      pan: new Animated.ValueXY(),
      opacity: new Animated.Value(1)
    }
  }

  componentWillMount() {

    this._val = { x:0, y:0 }
    this.state.pan.addListener((value) => this._val = value);

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      onPanResponderGrant: (e, gesture) => {
        Animated.timing(this.state.opacity, {
          toValue: 0.5,
          duration: 200
        }).start()
        this.state.pan.setOffset({
          x: this._val.x,
          y: this._val.y
        })
        this.state.pan.setValue({ x:0, y:0})
      },
      onPanResponderMove: Animated.event([ 
        null, { dx: this.state.pan.x, dy: this.state.pan.y }
      ]),
      onPanResponderRelease: (e, gesture) => {
        Animated.timing(this.state.opacity, {
          toValue: 1,
          duration: 200
        }).start()
      }
    })
  }

  render() {

    const panStyle = {
      transform: this.state.pan.getTranslateTransform()
    }
    return (
        <Animated.View 
          {...this.panResponder.panHandlers} 
          style={[panStyle, styles.panel, { opacity:this.state.opacity }]}
        >
          <Text style={styles.label}>{this.props.label}</Text>
        </Animated.View>      
      )
  }
}

class MyView extends React.Component {

  render() {
    return (
      <TouchableNativeFeedback 
        onPress={() => this.props.onFocusChange(this.props.id)}
      >

        <View style={[ styles.view, { 
          backgroundColor: this.props.color, 
          flex: this.props.flex,
        }]}>

          {this.props.data.map(a => (
              <Panel key={a} label={a} />
          ))}
        
        </View>
      </TouchableNativeFeedback>
    )
  }
}

export default class App extends React.Component {
  
  state = {
    focusOn: 0,
    flex : [3, 1]
  }

  _onPress = (focus) => {
    // Animate the update
    LayoutAnimation.spring()
    const flex = focus === 0 ? [3, 1] : [1, 3]
    this.setState({ focusOn: focus, flex })
  }


  render() {

    const colors = ['orangered', 'greenyellow']

    return (
      <View style={styles.container}>
        {[0,1].map(i => (
          <MyView id={i} key={i} 
          data={DATA[i]}
          color={colors[i]}
          flex={this.state.flex[i]}
          onFocusChange={this._onPress}
        />
        ))}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  view : {
    padding: 20,
    justifyContent: 'space-around',
  },
  panel : {
    backgroundColor: 'snow',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5
  },
  label: {
    fontSize: 40,
    color: 'lightgrey'
  }
});
