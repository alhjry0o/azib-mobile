// QamariyaPattern — repeated geometric motif (two interlocking rings + center dot).
// The motif echoes the AZIB brand identity (interlocking rings = union in marriage).
// Uses SVG <Pattern> for efficiency. Unique id per instance prevents clashes.

import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

let patternCounter = 0;

export interface QamariyaPatternProps {
  readonly width?: number;
  readonly height?: number;
  readonly color?: string;
  readonly opacity?: number;
  readonly tileSize?: number;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export function QamariyaPattern({
  width = 300,
  height = 300,
  color = '#F0CA68',
  opacity = 0.06,
  tileSize = 80,
  style,
  testID,
}: QamariyaPatternProps) {
  const [patternId] = useState(() => `qamariya-${++patternCounter}`);
  const half = tileSize / 2;

  return (
    <View style={[styles.container, style]} testID={testID} pointerEvents="none">
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} opacity={opacity}>
        <Defs>
          <Pattern
            id={patternId}
            x="0"
            y="0"
            width={tileSize}
            height={tileSize}
            patternUnits="userSpaceOnUse"
          >
            {/* Left ring */}
            <Circle
              cx={half - tileSize * 0.13}
              cy={half}
              r={tileSize * 0.22}
              stroke={color}
              strokeWidth="1"
              fill="none"
            />
            {/* Right ring (overlaps left) */}
            <Circle
              cx={half + tileSize * 0.13}
              cy={half}
              r={tileSize * 0.22}
              stroke={color}
              strokeWidth="1"
              fill="none"
            />
            {/* Center accent dot */}
            <Circle cx={half} cy={half} r={tileSize * 0.04} fill={color} />
            {/* Corner ticks */}
            <Circle cx={2} cy={2} r={1.2} fill={color} />
            <Circle cx={tileSize - 2} cy={2} r={1.2} fill={color} />
            <Circle cx={2} cy={tileSize - 2} r={1.2} fill={color} />
            <Circle cx={tileSize - 2} cy={tileSize - 2} r={1.2} fill={color} />
          </Pattern>
        </Defs>
        <Rect width={width} height={height} fill={`url(#${patternId})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    start: 0,
  },
});
