import { IonActionSheet, IonButton } from "@ionic/react";

interface ContainerProps {
  buttonText?: string;
  popupText?: string; 
  triggerId: string;
  additionalButtons?: { name: string; handler?: () => void }[]; 
}
        
const ActionSheet: React.FC<ContainerProps> = ({ buttonText, triggerId, popupText, additionalButtons }) => {
  const myButtonText = buttonText || 'Click Me';
  const myPopupText = popupText || 'Default Text';
  const myCancelButton = { text: 'Cancel', role: 'cancel', data: { action: 'cancel' } };
  const defaultAction = () => { console.log('No function passed in.') };

  const extraButtons = (additionalButtons || []).map(buttonInfo => ({
    text: buttonInfo.name,
    role: buttonInfo.name.toLowerCase() === 'delete' ? 'destructive' : 'custom',
    handler: buttonInfo.handler || defaultAction
  }));

  return (
    <>
      <IonButton id={triggerId}>{ myButtonText }</IonButton>
      <IonActionSheet
        trigger={triggerId}
        header={myPopupText}
        buttons={[
          ...extraButtons,
          myCancelButton,
        ]}
      ></IonActionSheet>
    </>
  );
};

export default ActionSheet;
