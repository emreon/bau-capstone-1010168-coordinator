import * as colors from './colors.js';

const degToRad = 0.017453292519943295;
const radToDeg = 57.29577951308232;

const options = { yOffset: 130 };
const arm = { len: 355, angleDeg: 0, next: { len: 375, angleDeg: 0 } };

let target = { x: 0, y: 0 };

export function solveIK(_target) {
    target = _target;

    const L1 = arm.len;
    const L2 = arm.next.len;

    let { x, y } = target;
    x = Math.max(x, 0);
    y = Math.max(y, 0) + options.yOffset;

    const a = Math.atan(y / x);
    const t2 = -Math.acos((x * x + y * y - L1 * L1 - L2 * L2) / (2 * L1 * L2));
    const t1 = Math.atan(y / x) - Math.atan((L2 * Math.sin(t2)) / (L1 + L2 * Math.cos(t2)));
    const t3 = t1 + t2;

    if (!isNaN(t1) && !isNaN(t2)) {
        arm.angleDeg = t1 * radToDeg;
        arm.next.angleDeg = t2 * radToDeg;
    }
    // else {
    //     arm.angleDeg = a * radToDeg;
    //     arm.next.angleDeg = 0;
    // }

    const t1Deg = parseInt(t1 * radToDeg);
    const t2Deg = parseInt(t2 * radToDeg);
    const t3Deg = parseInt(t3 * radToDeg);

    process.stdout.write(
        `${colors.FgYellow}[IK] X: ${x} Y: ${y} T1: ${t1Deg} T2: ${t2Deg} T3: ${t3Deg}${colors.Reset}\n`
    );
    return [t1Deg, t3Deg];
}
