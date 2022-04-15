const PosComponent = {
    name: "PosComponent",
    props: ["pos"],
    template: `<div class="pos" :class="{'big-text': pos <= 9, 'small-text': pos >= 10}"><span>{{ pos }}</span></div>`
}
