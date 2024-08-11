import prom from 'prom-client';

const register = new prom.Registry();
prom.collectDefaultMetrics({ register });

export default register;
