export class TouchScrollDebug {
  private static instance: TouchScrollDebug;
  private isEnabled = false;

  static getInstance(): TouchScrollDebug {
    if (!TouchScrollDebug.instance) {
      TouchScrollDebug.instance = new TouchScrollDebug();
    }
    return TouchScrollDebug.instance;
  }

  enable() {
    this.isEnabled = true;
    console.log('TouchScrollDebug enabled');
    this.logTouchCapabilities();
  }

  private logTouchCapabilities() {
    console.log('=== Touch Capabilities ===');
    console.log('ontouchstart:', 'ontouchstart' in window);
    console.log('ontouchmove:', 'ontouchmove' in window);
    console.log('ontouchend:', 'ontouchend' in window);
    console.log('maxTouchPoints:', navigator.maxTouchPoints);
    console.log('userAgent:', navigator.userAgent);
    console.log('platform:', navigator.platform);
    console.log('========================');
  }

  logTouchEvent(event: TouchEvent, eventType: string) {
    if (!this.isEnabled) return;
    
    console.log(`Touch ${eventType}:`, {
      touches: event.touches.length,
      changedTouches: event.changedTouches.length,
      target: event.target,
      currentTarget: event.currentTarget,
      coordinates: event.touches[0] ? {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
        pageX: event.touches[0].pageX,
        pageY: event.touches[0].pageY
      } : null
    });
  }

  logScrollEvent(element: HTMLElement, eventType: string) {
    if (!this.isEnabled) return;
    
    console.log(`Scroll ${eventType}:`, {
      scrollTop: element.scrollTop,
      scrollLeft: element.scrollLeft,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
      offsetHeight: element.offsetHeight
    });
  }

  checkScrollableElement(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    const isScrollable = style.overflow === 'auto' || 
                        style.overflow === 'scroll' || 
                        style.overflowY === 'auto' || 
                        style.overflowY === 'scroll';
    
    if (this.isEnabled) {
      console.log('Scrollable element check:', {
        element: element,
        overflow: style.overflow,
        overflowY: style.overflowY,
        isScrollable: isScrollable,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight
      });
    }
    
    return isScrollable;
  }
}

// Global instance
export const touchScrollDebug = TouchScrollDebug.getInstance(); 