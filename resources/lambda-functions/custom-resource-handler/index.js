"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const AWS = require("aws-sdk");
const REQUIRED_ENVS = [
    "STATE_MACHINE_ARN"
];
exports.handler = async (event) => {
    console.info('EVENT', event);
    const missing = REQUIRED_ENVS.filter(envName => !process.env[envName]);
    if (missing.length) {
        throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }
    const stepFunctions = new AWS.StepFunctions();
    // @ts-ignore
    return stepFunctions.startExecution({
        stateMachineArn: process.env.STATE_MACHINE_ARN,
        input: JSON.stringify(event)
    }).promise();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQkFBOEI7QUFrQjlCLE1BQU0sYUFBYSxHQUFHO0lBQ2xCLG1CQUFtQjtDQUN0QixDQUFBO0FBRVksUUFBQSxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQVksRUFBRSxFQUFFO0lBQzFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQzVCLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtJQUN0RSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7UUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7S0FDMUU7SUFDRCxNQUFNLGFBQWEsR0FBRyxJQUFJLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUM5QyxhQUFhO0lBQ2IsT0FBTyxhQUFhLENBQUMsY0FBYyxDQUFDO1FBQ2hDLGVBQWUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQjtRQUM5QyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7S0FDL0IsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ2hCLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEFXUyBmcm9tIFwiYXdzLXNka1wiXG5cbmludGVyZmFjZSBFdmVudCB7XG4gICAgRXhlY3V0aW9uSW5wdXQ6IHtcbiAgICAgICAgUmVxdWVzdFR5cGU6IHN0cmluZ1xuICAgICAgICBTZXJ2aWNlVG9rZW46IHN0cmluZ1xuICAgICAgICBSZXNwb25zZVVSTDogc3RyaW5nXG4gICAgICAgIFN0YWNrSWQ6IHN0cmluZ1xuICAgICAgICBSZXF1ZXN0SWQ6IHN0cmluZ1xuICAgICAgICBMb2dpY2FsUmVzb3VyY2VJZDogc3RyaW5nXG4gICAgICAgIFJlc291cmNlVHlwZTogc3RyaW5nXG4gICAgICAgIFJlc291cmNlUHJvcGVydGllczoge1xuICAgICAgICAgICAgU2VydmljZVRva2VuOiBzdHJpbmdcbiAgICAgICAgICAgIEV4ZWN1dGlvblRpbWU6IHN0cmluZ1xuICAgICAgICB9XG4gICAgfVxufVxuXG5jb25zdCBSRVFVSVJFRF9FTlZTID0gW1xuICAgIFwiU1RBVEVfTUFDSElORV9BUk5cIlxuXVxuXG5leHBvcnQgY29uc3QgaGFuZGxlciA9IGFzeW5jIChldmVudDogRXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmluZm8oJ0VWRU5UJywgZXZlbnQpXG4gICAgY29uc3QgbWlzc2luZyA9IFJFUVVJUkVEX0VOVlMuZmlsdGVyKGVudk5hbWUgPT4gIXByb2Nlc3MuZW52W2Vudk5hbWVdKVxuICAgIGlmIChtaXNzaW5nLmxlbmd0aCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1pc3NpbmcgZW52aXJvbm1lbnQgdmFyaWFibGVzOiAke21pc3Npbmcuam9pbignLCAnKX1gKVxuICAgIH1cbiAgICBjb25zdCBzdGVwRnVuY3Rpb25zID0gbmV3IEFXUy5TdGVwRnVuY3Rpb25zKCk7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHJldHVybiBzdGVwRnVuY3Rpb25zLnN0YXJ0RXhlY3V0aW9uKHtcbiAgICAgICAgc3RhdGVNYWNoaW5lQXJuOiBwcm9jZXNzLmVudi5TVEFURV9NQUNISU5FX0FSTixcbiAgICAgICAgaW5wdXQ6IEpTT04uc3RyaW5naWZ5KGV2ZW50KVxuICAgIH0pLnByb21pc2UoKVxufSJdfQ==