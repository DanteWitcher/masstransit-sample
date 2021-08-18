import masstransit from "masstransit-rabbitmq";
import { MessageType } from "masstransit-rabbitmq/dist/messageType";
import { Guid } from "guid-typescript";

interface IMessage {
	name: string;
}

const message: IMessage = {
	name: 'me',
} 

console.log(message.name);

// Start...

const bus = masstransit();

bus.on('connect', (resp) => {
	console.log('connect', resp);
});

bus.on('disconnect', (resp) => {
	console.log('disconnect', resp);
});

bus.on('error', (resp) => {
	console.log('error', resp);
});

bus.receiveEndpoint("orders", endpoint => {
    endpoint.handle(new MessageType("SubmitOrder"), async context => {

        console.log("Order submission received, OrderId:", context.message.OrderId, "Amount:", context.message.Amount)

        await context.respond({ OrderId: context.message.OrderId }, send => {
            send.messageType = new MessageType("OrderSubmitted").toMessageType()
        });
    });
});

let client = bus.requestClient({
    exchange: "orders",
    requestType: new MessageType("SubmitOrder"),
    responseType: new MessageType("OrderSubmitted"),
})

const submitOrder = setInterval(async () => {
    try {
        let response = await client.getResponse({OrderId: Guid.create().toString(), Amount: 123.45})

        console.log("Order submitted", response.message.OrderId)
    }
    catch (e) {
        console.error("failed to submit order", e.message)
    }
}, 1000);
