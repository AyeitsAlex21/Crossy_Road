import pygame as p

# Have river water
# Road


WIDTH = 640
HEIGHT = 480


def main():
    p.init()

    win = p.display.set_mode((WIDTH, HEIGHT))
    p.display.set_caption("Crossy Road")
    clock = p.time.Clock()


    run = True
    while run:
        for event in p.event.get():
            if event.type == p.QUIT:
                run = False



if __name__ == "__main__":
    main()