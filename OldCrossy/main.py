import pygame as p
from board import *
from classes import *
from macros import *

# Have river water
# Road
# people shoot on the right

BLACK = (0, 0, 0)
WHITE = (200, 200, 200)

def main():
    p.init()

    global HEIGHT, WIDTH, SCREEN, SCROLL_THRESH

    WIDTH = 640
    HEIGHT = 480
    SCROLL_THRESH = (HEIGHT / 2)
    CLOCK = p.time.Clock() # 60 frames a second
    SCREEN = p.display.set_mode((WIDTH, HEIGHT))
    
    p.display.set_caption("Crossy Road")

    player = Player()
    player_group = p.sprite.Group()
    player_group.add(player)
    GROUPS = {"Player":player_group}


    
    GROUPS["Cars"] = p.sprite.Group()
    GROUPS["Cars"].add(Car(1))
    GROUPS["Cars"].add(Car(2))

    GROUPS["Scene"] = p.sprite.Group()
    GROUPS["Scene"].add(Screen())

    scroll = 0
    run = True
    while run:
        CLOCK.tick(60)
        for event in p.event.get():
            if event.type == p.QUIT:
                run = False



        #draw scroll up
        # then update everyones elses y location by scroll

        
        GROUPS["Scene"].draw(SCREEN)
        GROUPS["Player"].draw(SCREEN)
        GROUPS["Cars"].draw(SCREEN)

        p.draw.line(SCREEN, BLACK, (0, SCROLL_THRESH), (WIDTH, SCROLL_THRESH))

        scroll = player.movement()
        GROUPS["Scene"].update(scroll)
        GROUPS["Player"].update()
        GROUPS["Cars"].update(scroll)

        p.display.update()

if __name__ == "__main__":
    main()