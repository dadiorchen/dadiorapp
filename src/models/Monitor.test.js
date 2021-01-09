jest.mock("axios");
const axios = require("axios");
const Monitor = require("./Monitor");
const expectR = require("expect-runtime");
const log = require("loglevel");


describe("ping", () => {

  it("", async () => {
    const res = await axios.get("http://localhost:5984");
    expectR(res).property("status").eq(200);
  });

  it("", async () => {
    async function ping(){
      try{
        await axios.get("http://localhost:5984");
      }catch(e){
        log.warn("e:", e);
        throw e;
      }
    }
    await expect(async () => {
      await ping();
    }).rejects.toThrow(/Network Error/);
  });
  
  function flushPromises() {
    // Wait for promises running in the non-async timer callback to complete.
    // From https://stackoverflow.com/a/58716087/308237
    return new Promise(resolve => setImmediate(resolve));
  }


  it.only("", async () => {
    jest.useFakeTimers();
    const monitor = new Monitor();
    const handleAlert = jest.fn(() => {
      log.warn("mock handler");
    });
    monitor.onAlert(handleAlert);
    axios.get
      //first time
      .mockResolvedValueOnce({status:200})
      //second time
      .mockResolvedValueOnce({status:200})
      //3
      .mockRejectedValueOnce(new Error("Network Error"));
    monitor.start();
    jest.runOnlyPendingTimers();
    await flushPromises();
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(handleAlert).not.toHaveBeenCalled();

    jest.runOnlyPendingTimers();
    await flushPromises();
    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(handleAlert).not.toHaveBeenCalled();

    jest.runOnlyPendingTimers();
    await flushPromises();
    expect(axios.get).toHaveBeenCalledTimes(3);
    expect(handleAlert).toHaveBeenCalled();

    monitor.stop();
    jest.runOnlyPendingTimers();
    await flushPromises();
    expect(axios.get).toHaveBeenCalledTimes(3);
  });


});
