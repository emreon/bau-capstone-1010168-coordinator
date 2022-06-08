const degToRad = 0.017453292519943295;
const radToDeg = 57.29577951308232;

const armWidth = 10;
const options = { yOffset: 30 };
const arm = { len: 180, angleDeg: 0, next: { len: 180, angleDeg: 0 } };

let target = { x: 0, y: 0 };
let mouse = { x: 0, y: 0 };

export function solveIK(_target) {
    target = _target;

    let { yOffset } = options;
    let { x, y } = target;
    x = Math.max(x, 0);
    y = Math.max(y, yOffset);

    const a = Math.atan(y / x);
    const t1 = -Math.acos((x * x + y * y - L1 * L1 - L2 * L2) / (2 * L1 * L2));
    const t2 = Math.atan(y / x) - Math.atan((L2 * Math.sin(q2)) / (L1 + L2 * Math.cos(q2)));
    const t3 = t1 + t2;

    if (!isNaN(t1) && !isNaN(t2)) {
        arm.angleDeg = t1 * radToDeg;
        arm.next.angleDeg = t2 * radToDeg;
    } else {
        arm.angleDeg = a * radToDeg;
        arm.next.angleDeg = 0;
    }

    const t1Deg = t1 * radToDeg;
    const t3Deg = t3 * radToDeg;
    return [t1Deg, t3Deg];
}
