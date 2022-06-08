const degToRad = 0.017453292519943295;
const radToDeg = 57.29577951308232;

const armWidth = 10;
const options = { yOffset: 100 };
const arm = { len: 345, angleDeg: 0, next: { len: 350, angleDeg: 0 } };

let target = { x: 0, y: 0 };
let mouse = { x: 0, y: 0 };

export function solveIK(_target) {
    target = _target;

    const { yOffset } = options;
    const L1 = arm.len;
    const L2 = arm.next.len;

    let { x, y } = target;
    x = Math.max(x, 0);
    y = Math.max(y, yOffset);

    const a = Math.atan(y / x);
    const t2 = -Math.acos((x * x + y * y - L1 * L1 - L2 * L2) / (2 * L1 * L2));
    const t1 = Math.atan(y / x) - Math.atan((L2 * Math.sin(t2)) / (L1 + L2 * Math.cos(t2)));
    const t3 = t1 + t2;

    if (!isNaN(t1) && !isNaN(t2)) {
        arm.angleDeg = t1 * radToDeg;
        arm.next.angleDeg = t2 * radToDeg;
    } else {
        arm.angleDeg = a * radToDeg;
        arm.next.angleDeg = 0;
    }

    const t1Deg = t1 * radToDeg;
    let t3Deg = t3 * radToDeg;
    // if (t3Deg < 0) t3Deg = t3Deg + 360;
    // if (t3Deg < 0) t3Deg = -t3Deg;

    return [t1Deg, t3Deg];
}
