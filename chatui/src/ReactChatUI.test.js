import ReactChatUI from "./ReactChatUI";
import { Widget, addResponseMessage, addUserMessage, addLinkSnippet,renderCustomComponent } from "react-chat-widget";



test("Test 1: main UI rendering", () => {
    const wrapper = mount(
      <ReactChatUI title='Welcome to Herald college chatbot' />
    );
  
    expect(wrapper).toMatchSnapshot();
    wrapper.unmount();
  });

  
test("Test 2: Widget must not be undefined ", () => {
    
    const wrapper = mount(
        <ReactChatUI title='Welcome to Herald college chatbot' />
      );
  
        //since Widget it child component of ReactChatUI 
        //and it is already rendered it should not be undefined
        //during rendering

      expect(wrapper.find(Widget)).not.toBe(undefined);
  
    // ensure that our spy (toggleForecast) was called when click was simulated
    //expect(spy.calledOnce).toBe(true);
  });


  test("Test 3: handleNewUserMessage() returns undefined", () => {
    
    const wrapper = mount(
        <ReactChatUI title='Welcome to Herald college chatbot' />
      );
  
        //since Widget it child component of ReactChatUI 
        //and it is already rendered it should not be undefined
        //during rendering

        expect(wrapper.instance().handleNewUserMessage('hello')).toBe(undefined);
      //expect(wrapper.find(Widget)).not.toBe(undefined);
  
    // ensure that our spy (toggleForecast) was called when click was simulated
    //expect(spy.calledOnce).toBe(true);
  });
