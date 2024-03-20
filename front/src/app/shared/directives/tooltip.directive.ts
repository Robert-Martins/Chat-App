import { Directive, ElementRef, HostListener, Input, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[swiftTooltip]'
})
export class TooltipDirective implements OnInit {

  private tooltip: HTMLSpanElement;

  private readonly TOOLTIP_CLASS: string = "swift-tooltip";

  private readonly TOOLTIP_SHOW_CLASS: string = "show";

  private readonly TOOLTIP_HIDE_CLASS: string = "hide";

  private readonly TOOLTIP_PARENT_CLASS: string = "tooltip-parent";

  @Input()
  public swiftTooltip: string;

  @HostListener("mouseover")
  public showTooltip(): void {
    const tooltipElement: HTMLSpanElement = this.tooltip;
    this.renderer.removeClass(tooltipElement, this.TOOLTIP_HIDE_CLASS);
    this.renderer.addClass(tooltipElement, this.TOOLTIP_SHOW_CLASS);
  }

  @HostListener("mouseout")
  public hideTooltip(): void {
    const tooltipElement: HTMLSpanElement = this.tooltip;
    this.renderer.removeClass(tooltipElement, this.TOOLTIP_SHOW_CLASS);
    this.renderer.addClass(tooltipElement, this.TOOLTIP_HIDE_CLASS);
  }

  constructor(
    private renderer: Renderer2,
    private elementRef: ElementRef,
  ) { 
    setInterval(() => console.log(this), 5000)
  }

  public ngOnInit(): void {
    this.createTooltip();
  }

  private createTooltip(): void {
    const parentElement: any = this.elementRef.nativeElement;
    const tooltip: HTMLSpanElement = this.renderer.createElement('span');
    this.renderer.setProperty(tooltip, 'innerHTML', this.swiftTooltip);
    this.renderer.setAttribute(tooltip, 'class', `${this.TOOLTIP_CLASS} ${this.TOOLTIP_HIDE_CLASS}`);
    this.renderer.addClass(parentElement, this.TOOLTIP_PARENT_CLASS);
    this.renderer.appendChild(parentElement, tooltip);
    this.tooltip = tooltip;
  }

}
