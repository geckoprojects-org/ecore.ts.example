import {ComponentRegistry} from "@/modelUiBuilder/impl/ComponentRegistry";
import {StringComponent} from "@/modelUiBuilder/impl/components/string/StringComponent";
import {DateTimeComponent} from "@/modelUiBuilder/impl/components/datetime/DateTimeComponent";
import {ReferenceComponent} from "@/modelUiBuilder/impl/components/reference/ReferenceComponent";
import {BooleanComponent} from "@/modelUiBuilder/impl/components/boolean/BooleanComponent";
import {IntComponent} from "@/modelUiBuilder/impl/components/int/IntComponent";

const cp = new ComponentRegistry();
const stringComponent = new StringComponent();
const dateTimeComponent = new DateTimeComponent();
const referenceComponent = new ReferenceComponent();
const boolComponent = new BooleanComponent();
const intComponent = new IntComponent();
cp.register(stringComponent);
cp.register(dateTimeComponent);
cp.register(referenceComponent);
cp.register(boolComponent);
cp.register(intComponent);

export function useComponentRegistry() {
    return { cp }
}
